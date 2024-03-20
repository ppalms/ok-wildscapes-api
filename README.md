# Oklahoma Wildscapes API

[![dev](https://github.com/ppalms/ok-wildscapes-api/actions/workflows/dev.yml/badge.svg)](https://github.com/ppalms/ok-wildscapes-api/actions/workflows/dev.yml)

## Getting Started

### Prerequisites

- An AWS account with an admin user
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) and Node 20 LTS
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install) package manager

### Local Dev Setup

- Copy your AWS admin credentials from the AWS access portal into your `.aws/credentials` file
- Run `yarn bootstrap`
- Verify deployment in the AWS console or by running `yarn test:e2e`
- Enjoy
