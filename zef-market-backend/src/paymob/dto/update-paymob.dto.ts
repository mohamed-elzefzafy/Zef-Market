import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymobDto } from './create-paymob.dto';

export class UpdatePaymobDto extends PartialType(CreatePaymobDto) {}
