#! /bin/bash
docker build -t gql-schema-stitching:test .
docker run -ti -p 4000:4000 --pid=host gql-schema-stitching:test
