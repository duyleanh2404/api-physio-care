import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class PaginatedResponseBaseDto<T> {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  data: T[];
}

export const PaginatedResponseDto = <TModel extends Type<any>>(
  model: TModel,
) => {
  class PaginatedResponseDtoClass extends PaginatedResponseBaseDto<TModel> {
    @ApiProperty({ type: [model] })
    declare data: TModel[];
  }

  return PaginatedResponseDtoClass;
};
