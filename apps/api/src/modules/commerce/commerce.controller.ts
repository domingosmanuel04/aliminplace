import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommerceService } from './commerce.service';
import { Public, RequirePerms } from '../../common/decorators';

@ApiTags('commerce')
@Controller()
export class CommerceController {
  constructor(@Inject(CommerceService) private c: CommerceService) {}

  @Get('stores')
  stores() {
    return this.c.listStores();
  }

  @Get('stores/:id')
  store(@Param('id') id: string) {
    return this.c.getStore(id);
  }

  @Patch('stores/:id')
  @RequirePerms('store.write')
  updateStore(@Param('id') id: string, @Body() body: any) {
    return this.c.updateStore(id, body);
  }

  @Post('stores/:id/publish')
  @RequirePerms('store.write')
  publish(@Param('id') id: string) {
    return this.c.publishStore(id);
  }

  @Get('products')
  @RequirePerms('products.read')
  products(@Query() q: any) {
    return this.c.listProducts(q);
  }

  @Post('products')
  @RequirePerms('products.write')
  createProduct(@Body() body: any) {
    return this.c.createProduct(body);
  }

  @Patch('products/:id')
  @RequirePerms('products.write')
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.c.updateProduct(id, body);
  }

  @Delete('products/:id')
  @RequirePerms('products.write')
  deleteProduct(@Param('id') id: string) {
    return this.c.deleteProduct(id);
  }

  @Get('orders')
  @RequirePerms('orders.read')
  orders(@Query() q: any) {
    return this.c.listOrders(q);
  }

  @Get('orders/:id')
  @RequirePerms('orders.read')
  order(@Param('id') id: string) {
    return this.c.getOrder(id);
  }

  @Patch('orders/:id/status')
  @RequirePerms('orders.write')
  orderStatus(@Param('id') id: string, @Body() body: any) {
    return this.c.updateOrderStatus(id, body.status, body);
  }

  @Post('orders/:id/refund')
  @RequirePerms('orders.refund')
  refund(@Param('id') id: string, @Body() body: any) {
    return this.c.refund(id, body.amount, body.reason);
  }

  @Get('customers')
  @RequirePerms('customers.read')
  customers(@Query('q') q?: string) {
    return this.c.listCustomers(q);
  }

  @Get('coupons')
  coupons() {
    return this.c.listCoupons();
  }

  @Post('coupons')
  @RequirePerms('marketing.write')
  createCoupon(@Body() body: any) {
    return this.c.createCoupon(body);
  }

  @Get('checkouts')
  checkouts() {
    return this.c.listCheckouts();
  }

  @Post('checkouts')
  @RequirePerms('checkout.write')
  saveCheckout(@Body() body: any) {
    return this.c.saveCheckout(body.id, body);
  }

  @Public()
  @Get('public/stores/:slug')
  publicStore(@Param('slug') slug: string) {
    return this.c.publicStore(slug);
  }

  @Public()
  @Get('public/stores/:slug/products/:productSlug')
  publicProduct(@Param('slug') slug: string, @Param('productSlug') productSlug: string) {
    return this.c.publicProduct(slug, productSlug);
  }

  @Public()
  @Get('public/stores/:slug/checkouts/:checkoutSlug')
  publicCheckout(@Param('slug') slug: string, @Param('checkoutSlug') checkoutSlug: string) {
    return this.c.publicCheckout(slug, checkoutSlug);
  }

  @Public()
  @Get('cart')
  cart(@Query('storeId') storeId: string, @Query('sessionId') sessionId: string) {
    return this.c.quoteCart(storeId, sessionId);
  }

  @Public()
  @Post('cart/items')
  addCart(@Body() body: any) {
    return this.c.addToCart(body);
  }

  @Public()
  @Patch('cart/items/:id')
  updateCart(@Param('id') id: string, @Body() body: any) {
    return this.c.updateCartItem(id, body.quantity);
  }

  @Public()
  @Post('cart/coupon')
  coupon(@Body() body: any) {
    return this.c.applyCoupon(body.storeId, body.sessionId, body.code);
  }

  @Public()
  @Post('checkout')
  checkout(@Body() body: any) {
    return this.c.checkout(body);
  }

  @Public()
  @Post('payments/confirm')
  confirm(@Body() body: { providerRef: string }) {
    return this.c.confirmPayment(body.providerRef);
  }

  @Public()
  @Post('upsell/accept')
  upsell(@Body() body: any) {
    return this.c.acceptUpsell(body.orderId, body.upsellId, body.method, body.token);
  }
}
