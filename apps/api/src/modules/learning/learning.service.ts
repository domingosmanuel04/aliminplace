import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ctx } from "../../common/als";
import { randomBytes } from "node:crypto";

@Injectable()
export class LearningService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async myEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            product: { include: { media: true } },
            modules: { include: { lessons: true } },
          },
        },
        certificates: true,
      },
    });
  }

  async courseForStudent(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: { orderBy: { position: "asc" } } },
              orderBy: { position: "asc" },
            },
            quizzes: { include: { questions: true } },
            product: true,
          },
        },
        progressItems: true,
      },
    });
    if (!enrollment) throw new ForbiddenException("Sem acesso a este curso");
    return enrollment;
  }

  async saveProgress(
    userId: string,
    lessonId: string,
    positionSec: number,
    completed: boolean,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException();
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: lesson.module.courseId, userId } },
    });
    if (!enrollment) throw new ForbiddenException();
    await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
      },
      update: { positionSec, completed },
      create: { enrollmentId: enrollment.id, lessonId, positionSec, completed },
    });
    const total = await this.prisma.lesson.count({
      where: { module: { courseId: enrollment.courseId } },
    });
    const done = await this.prisma.lessonProgress.count({
      where: { enrollmentId: enrollment.id, completed: true },
    });
    const progress = total ? (done / total) * 100 : 0;
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        lastLesson: lessonId,
        completedAt: progress >= 100 ? new Date() : null,
      },
    });
    if (progress >= 100) {
      const existing = await this.prisma.certificate.findFirst({
        where: { enrollmentId: enrollment.id },
      });
      if (!existing) {
        await this.prisma.certificate.create({
          data: {
            courseId: enrollment.courseId,
            enrollmentId: enrollment.id,
            userId,
            code: `TRN-${randomBytes(5).toString("hex").toUpperCase()}`,
          },
        });
      }
    }
    return { progress };
  }

  async attemptQuiz(
    userId: string,
    quizId: string,
    answers: Record<string, string>,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException();
    const attempts = await this.prisma.quizAttempt.count({
      where: { quizId, userId },
    });
    if (attempts >= quiz.maxAttempts)
      throw new ForbiddenException("Tentativas esgotadas");
    let score = 0;
    let total = 0;
    for (const q of quiz.questions) {
      total += q.points;
      if (
        (answers[q.id] || "").trim().toLowerCase() ===
        q.answer.trim().toLowerCase()
      )
        score += q.points;
    }
    const pct = total ? Math.round((score / total) * 100) : 0;
    return this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score: pct,
        passed: pct >= quiz.passScore,
        answers,
      },
    });
  }

  async verifyCertificate(code: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { code },
      include: { course: { include: { product: true } }, user: true },
    });
    if (!cert) throw new NotFoundException("Certificado inválido");
    return {
      valid: true,
      code: cert.code,
      student: cert.user.name,
      course: cert.course.product.name,
      issuedAt: cert.issuedAt,
    };
  }

  async saveCurriculum(productId: string, modules: any[]) {
    const tenantId = ctx().tenantId;
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException();
    let course = await this.prisma.course.findUnique({ where: { productId } });
    if (!course)
      course = await this.prisma.course.create({ data: { productId } });
    await this.prisma.courseModule.deleteMany({
      where: { courseId: course.id },
    });
    for (const [i, m] of modules.entries()) {
      const mod = await this.prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: m.title,
          position: i + 1,
          locked: !!m.locked,
        },
      });
      for (const [j, l] of (m.lessons || []).entries()) {
        const videoUrls = Array.isArray(l.videoUrls)
          ? l.videoUrls
          : l.videoUrl
            ? [l.videoUrl]
            : [];
        const primaryVideoUrl = l.videoUrl || videoUrls[0] || null;
        await this.prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: l.title,
            type: l.type || "video",
            content: l.content,
            videoUrl: primaryVideoUrl,
            videoUrls,
            durationSec: l.durationSec || 0,
            downloadable: !!l.downloadable,
            position: j + 1,
          },
        });
      }
    }
    return this.prisma.course.findUnique({
      where: { id: course.id },
      include: { modules: { include: { lessons: true } } },
    });
  }
}
