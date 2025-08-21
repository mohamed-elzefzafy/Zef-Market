// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { CreateSessionRequestDto } from './dto/create-session.dto';
// import Stripe from 'stripe';
// import { ConfigService } from '@nestjs/config';
// import { CourseService } from 'src/course/course.service';

// @Injectable()
// export class StripeService {
//   constructor(
//     private readonly stripe: Stripe,
//     private readonly courseService: CourseService,
//     private readonly configService: ConfigService,
//   ) {}
//   public async createSession(courseId: string, userId: string) {
//     const course = await this.courseService.findOneWithoutpopulate(courseId);
//     if(course.instructor.toString() === userId.toString()) {
//       throw new BadRequestException("you can't buy your course")
//     }

//       if(!course.isPublished) {
//       throw new BadRequestException("the course is not published")
//     }

//       if(course.isFree) {
//       throw new BadRequestException("the course is free you can subscribe to it without payment")
//     }

// // if (course.isFree) {
// // if (!course.users.includes(userId)) {
// //   course.users.push(userId);
// //   await course.save();
// //   return {message :`you have subscribed to ${course.title} cousre`}
// // } else {
// //     return {message :`you already subscribed to ${course.title} cousre`}
// // }
// // }
//     return this.stripe.checkout.sessions.create({
//       metadata: {
//         courseId,
//         userId,
//       },
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             unit_amount: course.finalPrice * 100,
//             product_data: {
//               name: course.title,
//               description: course.description,
//               images: [course.thumbnail.url],
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: `${this.configService.getOrThrow('STRIPE_SUCCESS_URL')}/course/${courseId}`,
//       cancel_url:   this.configService.getOrThrow('STRIPE_CANCEL_URL'),
//     });
//   }
// async handleCheckoutWebhook(event: any) {
//   console.log(event);

//   if (event.type !== 'checkout.session.completed') return;

//   const session = await this.stripe.checkout.sessions.retrieve(
//     event.data.object.id
//   );

//   const metadata = session.metadata;

//   if (!metadata || !metadata.courseId || !metadata.userId) {
//     throw new NotFoundException("Missing session metadata (courseId/userId)");
//   }
// console.log("ggggggggggggggggggggggg");

//   // ✅ مرر userId مباشرة
//   await this.courseService.updateCheckOut(metadata.courseId, metadata.userId );
// }
// }
