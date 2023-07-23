import { createCustomParamDecorator } from '@midwayjs/core';

export const PAGE_NO_KEY = 'decorator:page_no';

export const PAGE_SIZE_KEY = 'decorator:page_size';

export function defaultPageNo(): ParameterDecorator {
  return createCustomParamDecorator(PAGE_NO_KEY, {});
}

export function defaultPageSize(): ParameterDecorator {
  return createCustomParamDecorator(PAGE_SIZE_KEY, {});
}
