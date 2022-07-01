export interface ResponseData<D extends any> {
  code: number;
  data?: D;
  msg?: string;
}

export type MonoRequestFn<D> = Promise<ResponseData<D>>;
