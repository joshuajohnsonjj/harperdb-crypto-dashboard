import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: 'src/db/schema/schema.graphql',
	generates: {
		'src/types/graphql.ts': {
			plugins: ['typescript', 'typescript-operations'],
		},
	},
};

export default config;
