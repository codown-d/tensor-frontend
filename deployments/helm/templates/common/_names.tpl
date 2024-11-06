{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "common.names.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "common.names.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "common.names.fullname" -}}
{{- $prefixName := default "csec" .Values.global.prefixName -}}
{{- if .Values.fullnameOverride -}}
{{- printf "%s-%s" $prefixName .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s-%s" $prefixName .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}





{{/*
Create a default fully qualified app for console.
*/}}
{{- define "common.console.defaultName" -}}
{{- $prefixName := default "csec" .Values.global.prefixName -}}
{{- $name := default "console" .Values.global.defaultNameOverride.console -}}
{{- printf "%s-%s" $prefixName $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app for scanner.
*/}}
{{- define "common.scanner.defaultName" -}}
{{- $prefixName := default "csec" .Values.global.prefixName -}}
{{- $name := default "scanner" .Values.global.defaultNameOverride.scanner -}}
{{- printf "%s-%s" $prefixName $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app for scanner dockerregistry.
*/}}
{{- define "common.scanner.dockerregistry.defaultName" -}}
{{- $prefixName := default "csec" .Values.global.prefixName -}}
{{- $name := default "scanner-dockerregistry" .Values.global.defaultNameOverride.dockerregistry -}}
{{- printf "%s-%s" $prefixName $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

