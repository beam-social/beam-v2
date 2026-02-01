import { Client } from 'beamsocial';

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const apiUrl = (config.public.apiUrl as string) || 'http://localhost:5000';
	const client = new Client(apiUrl);

	return {
		provide: {
			apiUrl,
			client
		}
	};
});
