# LambStatus

[![Launch CloudFormation Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=StatusPage&templateURL=https://s3-ap-northeast-1.amazonaws.com/lambstatus/cf-template/0.6.6/lamb-status.yml)
[![wercker status](https://app.wercker.com/status/fcb6fb7398629e934ae0538737021d14/s/master "wercker status")](https://app.wercker.com/project/byKey/fcb6fb7398629e934ae0538737021d14)
[![API Document](https://img.shields.io/badge/api-v0-blue.svg)](https://genicssoftware.github.io/lambstatus.github.io/apidocs/)

*The project is now in the maintenance mode. Only critical bugs will be fixed, and there won’t be any more feature development. Also, the project will be archived after the end of February 2020. So please consider moving to other projects like [Cachet](https://github.com/CachetHQ/Cachet).*

LambStatus is the serverless status page system. [See our website](https://genicssoftware.github.io/lambstatus.github.io/) for features.

## Demo

* [Status page](https://demo-status.lambstatus.org): the page to tell your service's status to your users
* [Admin page](https://demo-admin.lambstatus.org): the page to change your service's status

## Get Started

See [the getting started page](https://genicssoftware.github.io/lambstatus.github.io/get-started) to build your first status page with just a few clicks!

## Goals of this project

* Offers an open source and serverless status page system.
* Offers a pay-as-you-go pricing approach like AWS. We estimate the system takes just *$1 to handle 30,000 visitors* ([see details](https://genicssoftware.github.io/lambstatus.github.io/cost-estimate)).
* Enables you to build and maintain the status page system with minimum effort.

## Why Serverless?

Status page system is great with the Serverless architecture, because:

* It eases your pain caused by the scaling / availability issues. It is terrible if your service is down AND heavy traffic from stuck users stops your status page.
* It enables you to pay only for what you use. A status page only occasionally gets huge traffic. The system takes only $1 per 30,000 visitors and almost $0 if no visitors.

## Build Lambda ZIPs Locally (No AWS / No Apex)

These steps generate the Lambda ZIPs in `packages/lambda/build` without needing AWS credentials or the Apex CLI.

```
cd packages/lambda
npm install
npm run zip:offline
```

The ZIP files will be written to:

```
packages/lambda/build/*.zip
```

## Build Frontend Assets Locally (Offline)

This builds the static admin and status page assets without AWS credentials and writes them under `packages/frontend/dist`.

```
cd packages/frontend
npm install
LAMBSTATUS_API_URL=https://status.example.com \
LAMBSTATUS_USER_POOL_ID=your-user-pool-id \
LAMBSTATUS_CLIENT_ID=your-client-id \
npm run build:offline
```

Outputs:

```
packages/frontend/dist/admin-page
packages/frontend/dist/status-page
```
