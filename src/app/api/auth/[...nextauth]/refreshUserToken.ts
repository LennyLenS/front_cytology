import apiInstance from '@/utils/apiInstance'

export default async function refreshUserToken(token:string){

    console.log('refreshing user token');
    console.log(token);

    // В новом API endpoint /refresh (без префикса auth/)
    // refresh_token передается в теле запроса, а не в заголовке
    const response= await apiInstance({
        method:'POST',
        url:`/api/v1/refresh`,
        data: {
            refresh_token: token
        }
    });

    console.log('response.data', response.data);

    const {access_token, refresh_token}=response.data;

    console.log('Получен новый refresh_token', refresh_token);

    return {access_token, refresh_token};

}
