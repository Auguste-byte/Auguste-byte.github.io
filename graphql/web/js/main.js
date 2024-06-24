import { Router } from "./router.js";



const logname = document.getElementsByName('Username')[0];
const logpass = document.getElementsByName('password')[0];
const Error = document.getElementById('Error')


let data
let userData
let skillData
let ratioData

let graphData = ""
let graphData2 = ""


async function LoginForm() {
    document.getElementById('login').addEventListener('click', (event) => {
        event.preventDefault();
        
        getToken(logname.value, logpass.value)
        .then(getToken => {
            console.log('Token obtenu :', getToken);
                Router()
               
        })
        .catch(error => {
            console.error('Erreur lors de l\'obtention du token :', error);
            if (Error) {
                Error.style.opacity = '1'; 
                setTimeout(() => {
                    Error.style.opacity = '0';
                }, 1000); 
            }
        });

        document.getElementById('App').addEventListener('click', function(event) {
            if (event.target && event.target.id === 'logout') {
                Logout()
            }
    });

})
}


async function getToken(username, password) {
    const endpoint = 'https://zone01normandie.org/api/auth/signin';
 
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }else{
        const token = await response.json();
        query(token)
    } 
    
}



async function query(token) {
    const endpoint = 'https://zone01normandie.org/api/graphql-engine/v1/graphql'

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            query: `
            query{
                user {
                    id
                    login
                    attrs
                    totalUp
                    totalDown
                    auditRatio
                    transactions (where: {eventId: {_eq: 148}}, order_by: {createdAt:asc}){
                    amount
                    type
                    createdAt
                    path
                    }
                }
                transaction{
                    id
                    type
                    amount
                    objectId
                    userId
                    createdAt
                    path
                }
            }`
        })
    })
    
    if (!response.ok) {
        throw new Error(`HTTP eror! Status: ${response.status}`)
    }

    data = await response.json()
    userData = data.data.user[0]
    skillData = data.data.transaction
    
    console.log("User data: ", userData)
    console.log("Skill data:", skillData)

    let skillGo = skillData.filter(skillData => skillData.type.includes('go'))
    let lastSkillGo = skillGo.length > 0 ? skillGo[skillGo.length - 1] : null;

    let skillBack = skillData.filter(skillData => skillData.type.includes('back'))
    let lastSkillBack = skillBack.length > 0 ? skillBack[skillBack.length - 1] : null;

    let skillFront = skillData.filter(skillData => skillData.type.includes('front'))
    let lastSkillFront = skillFront.length > 0 ? skillFront[skillFront.length - 1] : null;

    let skillHtml = skillData.filter(skillData => skillData.type.includes('html'))
    let lastSkillHtml = skillHtml.length > 0 ? skillHtml[skillHtml.length - 1] : null;

    let skillJs = skillData.filter(skillData => skillData.type.includes('js'))
    let lastSkillJs = skillJs.length > 0 ? skillJs[skillJs.length - 1] : null;


    graphData = `${lastSkillGo.amount};${lastSkillBack.amount};${lastSkillFront.amount};${lastSkillHtml.amount};${lastSkillJs.amount}`
    graphData2= `${userData.totalUp};${userData.totalDown}`


    send() 
   
}


function send() {
    const userContainer = document.getElementById('User-container');
    if (userContainer) {
        const infoUser = document.createElement('div');
        const dataUser = document.createElement('div');
        infoUser.id = 'userDiv';
        dataUser.id = 'dataDiv'
        infoUser.innerHTML = `<b>${userData.attrs.firstName} ${userData.attrs.lastName} </b> <br> ${userData.attrs.addressStreet} <br> ${userData.attrs.addressPostalCode} ${userData.attrs.addressCity}`
        dataUser.innerHTML = `<br> Attentes: <br> <br> ${userData.attrs.attentes}`

        userContainer.appendChild(infoUser);
        userContainer.appendChild(dataUser)
    }

    const skillContainer = document.getElementById('skill-container');
    if (skillContainer) {
        let pieChart = skillContainer.querySelector('pie-chart');
        if (!pieChart) {
            pieChart = document.createElement('pie-chart');
            skillContainer.appendChild(pieChart);
        }
        pieChart.setAttribute('data', graphData);
    }

    const xpContainer = document.getElementById('xp-container');
    if (xpContainer) {
        let pieChart2 = xpContainer.querySelector('pie-chart2');
        if (!pieChart2) {
            pieChart2 = document.createElement('pie-chart2');
            xpContainer.appendChild(pieChart2);
        }
        pieChart2.setAttribute('data', graphData2);
    }

    const appContent = document.querySelector('#title')
    appContent.innerText = `${userData.auditRatio}`
}



function Logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.reload()
}


LoginForm();

