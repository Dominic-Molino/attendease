import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import {
  ServerTransferStateModule,
  provideServerRendering,
} from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), ServerTransferStateModule],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
