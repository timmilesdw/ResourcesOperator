const { env } = process;

const defaultValues = {
  limits: {
    memory: env.MEMORY || '250Mi',
    cpu: env.CPU || '250m',
  },
  requests: {
    memory: env.MEMORY_REQ || '50Mi',
    cpu: env.CPU_REQ || '50m',
  },
  max: {
    memory: env.MEMORY_MAX || '500Mi',
    cpu: env.CPU_MAX || '500m',
  },
  type: env.TYPE || 'Container',
  excludeNamespaces: env.EXCLUDE_NS || 'kube-system,kube-node-lease,kube-public',
};

export default defaultValues;
