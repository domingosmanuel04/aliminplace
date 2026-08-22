import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { Public, RequirePerms } from '../../common/decorators';
import { ctx } from '../../common/als';

@ApiTags('learning')
@Controller()
export class LearningController {
  constructor(@Inject(LearningService) private l: LearningService) {}

  @Get('members/enrollments')
  enrollments() {
    return this.l.myEnrollments(ctx().userId!);
  }

  @Get('members/courses/:id')
  course(@Param('id') id: string) {
    return this.l.courseForStudent(id, ctx().userId!);
  }

  @Post('members/progress')
  progress(@Body() body: any) {
    return this.l.saveProgress(ctx().userId!, body.lessonId, body.positionSec || 0, !!body.completed);
  }

  @Post('members/quizzes/:id/attempt')
  quiz(@Param('id') id: string, @Body() body: any) {
    return this.l.attemptQuiz(ctx().userId!, id, body.answers || {});
  }

  @Public()
  @Get('verify/certificate/:code')
  verify(@Param('code') code: string) {
    return this.l.verifyCertificate(code);
  }

  @Post('courses/:productId/curriculum')
  @RequirePerms('courses.write')
  curriculum(@Param('productId') productId: string, @Body() body: any) {
    return this.l.saveCurriculum(productId, body.modules || []);
  }
}
