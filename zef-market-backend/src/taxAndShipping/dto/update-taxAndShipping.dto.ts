import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxAndShippingDto } from './create-taxAndShipping.dto';

export class UpdateTaxAndShippingDto extends PartialType(CreateTaxAndShippingDto) {}
