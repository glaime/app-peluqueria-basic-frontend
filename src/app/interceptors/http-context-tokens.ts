import { HttpContextToken } from '@angular/common/http';

export const OMITIR_ERROR_GLOBAL = new HttpContextToken<boolean>(() => false);