import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AlertService } from 'src/alert/services/alert.service';
import RequestResponseAlert from '../models/interfaces/request-response-alert.interface';

@Resolver(() => RequestResponseAlert)
export class RequestResponseAlertResolver {
  constructor(private readonly alertService: AlertService) {}

  @ResolveField()
  async request(@Parent() parent: RequestResponseAlert) {
    return await this.alertService.getAlert(parent.id).request();
  }
}
