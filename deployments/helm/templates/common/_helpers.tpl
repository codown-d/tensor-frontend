{{/*
Return the proper Frontend image name
*/}}
{{- define "fronted.image" -}}
{{- $registryName := (include "common.tplvalues.render" ( dict "value" .Values.image.registry "context" $)) -}}
{{- $repositoryName := (include "common.tplvalues.render" ( dict "value" .Values.image.repository "context" $)) -}}
{{- $imageName := .Values.image.name -}}
{{- $tag := .Values.image.tag | toString -}}

{{- printf "%s/%s/%s:%s" $registryName $repositoryName $imageName $tag -}}
{{- end -}}

