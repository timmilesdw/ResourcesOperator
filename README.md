# Resource Operator for k8s

Operator that automatically creates LimitRanges in namespaces

# Configuration

## Default values
You can set default values by changing ConfigMap in manifests folder

Default values are
```yaml
limits:
    memory: '250Mi'
    cpu: '250m'
requests:
    memory: '50Mi'
    cpu: '50m'
max:
    memory: '500Mi'
    cpu: '500m'
type: 'Container'
excludeNamespaces: 'kube-system,kube-node-lease,kube-public'
```
## Configure namespaces through annotations

You can configure values for namespace by changing namespace annotations:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: test
  annotations:
    resource-operator.limits/type: 'Container'
    resource-operator.limits/memory: '100Mi'
    resource-operator.limits/cpu: '100m'
    resource-operator.limits/memory-requests: '500Mi' 
    resource-operator.limits/cpu-requests: '50m'
    resource-operator.limits/max-memory: '500Mi'
    resource-operator.limits/max-cpu: '50m'
    resource-operator/disabled: 'true'
```

You can exclude certain namespaces through env var EXCLUDE_NS

Default excluded namespaces are kube-system,kube-node-lease,kube-public

## Deploy

```bash
kubectl apply -f manifests/
```

## Developing

1. Clone repository

2. devspace dev

3. npm install

4. npm run build

5. node ./build/index.js

## Contributing

1. Fork repo

2. Commit changes

3. Create pull request