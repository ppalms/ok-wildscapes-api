#!/bin/bash

# Setup email alerts for form submission failures
# Usage: ./scripts/setup-alerts.sh your-email@example.com

if [ $# -eq 0 ]; then
    echo "Usage: $0 <email-address>"
    echo "Example: $0 admin@okwildscapes.com"
    exit 1
fi

EMAIL=$1
STAGE=${2:-dev}

# Get the SNS topic ARN from CloudFormation outputs
TOPIC_ARN=$(aws cloudformation describe-stacks \
    --stack-name ok-wildscapes-service-${STAGE} \
    --query 'Stacks[0].Outputs[?OutputKey==`AlertingTopicArn`].OutputValue' \
    --output text \
    --region us-east-1)

if [ -z "$TOPIC_ARN" ]; then
    echo "Error: Could not find AlertingTopicArn in CloudFormation outputs"
    echo "Make sure the stack is deployed with the monitoring resources"
    exit 1
fi

echo "Subscribing $EMAIL to alerts topic: $TOPIC_ARN"

# Subscribe email to SNS topic
aws sns subscribe \
    --topic-arn "$TOPIC_ARN" \
    --protocol email \
    --notification-endpoint "$EMAIL" \
    --region us-east-1

echo "Email subscription created. Check your email and confirm the subscription."