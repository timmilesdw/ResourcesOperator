import * as k8s from '@kubernetes/client-node';
import Operator, { ResourceEventType, OperatorLogger } from '@dot-i/k8s-operator';
import { V1LimitRangeItem } from '@kubernetes/client-node';
import defaultValues from '../config';

export default class ResourceOperator extends Operator {
  constructor(protected log: OperatorLogger) {
    super(log);
  }

  protected async init() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const excludes = defaultValues.excludeNamespaces.split(',');
    await this.watchResource('', 'v1', 'namespaces', async (e) => {
      const { object, type } = e;
      const { metadata } = object;
      if (!metadata) {
        return;
      }
      const name = metadata.name!;
      if (excludes.includes(name)) {
        this.log.info(`Skipping excluded namespace: ${name}`);
        return;
      }
      const { annotations } = metadata;

      const disabled = annotations && annotations['resource-operator/disabled'];
      const limits = this.fetchLimitRangeSpec(annotations);

      switch (type) {
        case ResourceEventType.Added:
          if (disabled) {
            this.log.info(`Disabled limit range for namespace ${name}`);
            break;
          }
          try {
            await k8sApi.createNamespacedLimitRange(name, {
              metadata: {
                name,
              },
              spec: {
                limits: [
                  limits,
                ],
              },
            });
            this.log.info(`Created LimitRange: ${name} in namespace ${name}`);
          } catch (err: any) {
            const { response: { statusCode, body } } = err;
            // StatusCode 409 means that limitrange already exists
            // We will patch this resource
            if (statusCode === 409) {
              k8sApi.patchNamespacedLimitRange(name, name, {
                spec: {
                  limits: [
                    limits,
                  ],
                },

              }, undefined, undefined, undefined, undefined, {
                headers: {
                  'Content-Type': 'application/strategic-merge-patch+json',
                },
              })
                .then(() => this.log.info(`Successfully patched resource: ${name}`))
                .catch((error: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-shadow
                  const { response: { statusCode, body } } = error;
                  this.log.error(`${statusCode}: err body: ${body.message}`);
                });
              break;
            }
            this.log.error(`${statusCode}: err body: ${body.message}`);
          }
          break;
        case ResourceEventType.Modified:
          try {
            await k8sApi.patchNamespacedLimitRange(name, name, {
              spec: {
                limits: [
                  limits,
                ],
              },
            });
            this.log.info(`Patched LimitRange: ${name} in namespace ${name}`);
          } catch (err: any) {
            const { response: { statusCode, body } } = err;
            this.log.error(`${statusCode}: err body: ${body.message}`);
          }
          break;
        default:
          break;
      }
    });
  }

  // Fetching LimitRange spec from namespace annotations
  // eslint-disable-next-line class-methods-use-this
  private fetchLimitRangeSpec(annotations: { [key: string]: string } = {}): V1LimitRangeItem {
    const {
      limits, requests, max, type,
    } = defaultValues;

    return {
      type: annotations['resource-operator.limits/type'] || type,
      _default: {
        memory: annotations['resource-operator.limits/memory'] || limits.memory,
        cpu: annotations['resource-operator.limits/cpu'] || limits.cpu,
      },
      defaultRequest: {
        memory: annotations['resource-operator.limits/memory-requests'] || requests.memory,
        cpu: annotations['resource-operator.limits/cpu-requests'] || requests.cpu,
      },
      max: {
        memory: annotations['resource-operator.limits/max-memory'] || max.memory,
        cpu: annotations['resource-operator.limits/max-cpu'] || max.cpu,
      },
    };
  }
}
