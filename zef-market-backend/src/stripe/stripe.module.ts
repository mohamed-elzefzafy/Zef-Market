// import { Inject, Module } from '@nestjs/common';
// import { StripeController } from './stripe.controller';
// import { StripeService } from './stripe.service';
// import Stripe from 'stripe';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JwtModule } from '@nestjs/jwt';
// import { CourseModule } from 'src/course/course.module';

// @Module({
//   imports: [ConfigModule, CourseModule, JwtModule],
//   controllers: [StripeController],
//   providers: [
//     StripeService,
//     {
//       provide: Stripe,
//       useFactory: (configService: ConfigService) =>
//         new Stripe(configService.getOrThrow<string>('STRIPE_SECRET_KEY')),
//       inject: [ConfigService],
//     },
//   ],
// })
// export class StripeModule {}
