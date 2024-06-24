

export async function Router(){
    const appContent = document.querySelector('#App')
    appContent.innerHTML = await (await fetch("/graphql/web/templates/mainPage.html")).text();
}