import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SuperAdmin } from '../../common/decorators';

@ApiTags('admin')
@SuperAdmin()
@Controller('admin')
export class AdminController {
  constructor(@Inject(AdminService) private a: AdminService) {}

  @Get('overview')
  overview() {
    return this.a.overview();
  }

  @Get('tenants')
  tenants() {
    return this.a.tenants();
  }

  @Patch('tenants/:id')
  setTenant(@Param('id') id: string, @Body() body: any) {
    return this.a.setTenantStatus(id, body.status);
  }

  @Get('users')
  users() {
    return this.a.users();
  }

  @Patch('users/:id')
  setUser(@Param('id') id: string, @Body() body: any) {
    return this.a.setUserStatus(id, body.status);
  }

  @Get('fees')
  fees() {
    return this.a.fees();
  }

  @Patch('fees/:id')
  saveFee(@Param('id') id: string, @Body() body: any) {
    return this.a.saveFee(id, body);
  }

  @Get('payouts')
  payouts() {
    return this.a.payouts();
  }

  @Patch('payouts/:id')
  decide(@Param('id') id: string, @Body() body: any) {
    return this.a.decidePayout(id, body.status, body.note);
  }

  @Get('logs')
  logs() {
    return this.a.logs();
  }

  @Get('reports')
  reports() {
    return this.a.reports();
  }
}
