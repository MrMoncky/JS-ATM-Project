

/* Codigo para importar Base de Datos desde Firebase */ 

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCM0f3wEqKFXRNYTEy-JqS_U5j1dhXHV9g",
  authDomain: "banco-patitas.firebaseapp.com",
  projectId: "banco-patitas",
  storageBucket: "banco-patitas.appspot.com",
  messagingSenderId: "289456860585",
  appId: "1:289456860585:web:5f92aa65244bc3a5f068b8",
  measurementId: "G-CFHX9B3B3M"
};

window.onload = function(){
        const app = initializeApp(firebaseConfig);
        const db = getDatabase();
        const dbref = ref(db);

    document.getElementById('switchRegisterBtn').onclick = switchToReg;
    document.getElementById('switchLogBtn').onclick = switchToLogin;
    document.getElementById("login-btn").onclick = loginValidation;
    document.getElementById("register-btn").onclick = registerValidation;

/* Funcion para cambiar a pantalla de activacion de Tarjeta (Registro) */

function switchToReg() {
    document.getElementById('register-menu').style = "display:inline-block";
    document.getElementById('login-menu').style = "display:none";
}

/* Funcion para regresar de Login */

function switchToLogin() {
    document.getElementById('register-menu').style = "display:none";
    document.getElementById('login-menu').style = "display:inline-block";
} 

/* Variables para Definir Usuario y Contrasena */

var AccNumPat = "^[0-9]{6}$";  //Limita la longitud del usuario a 6 digitos 
var AccPassPat = "^[0-9]{4}$"; //Limita la longitud de la contrasena a 4 digitos

/* Validacion de Informacion para Acceder */


function loginValidation(){
    var loginAccNum = document.getElementById('loginAccNum').value;
    var loginPass = document.getElementById('loginPass').value;
    if(loginAccNum.match(AccNumPat) && loginPass.match(AccPassPat)){
        portal(loginAccNum,loginPass);
    }else{
        alert("Enter Valid Account and Password"); 
    }
}




/* Registro de Nuevos Usuarios, Activacion de Tarjetas */

function registerValidation(){
var rAccName = document.getElementById("rAccName").value;
var rAccNum = document.getElementById("rAccNum").value;
var rAccPass = document.getElementById("rAccPass").value;
var rAccConfPass = document.getElementById("rAccConfPass").value;
if(rAccName!==null && rAccNum.match(AccNumPat) && rAccPass.match(AccPassPat) && rAccPass == rAccConfPass){

    set(ref(db,"accNum "+rAccNum+"/accPass "+rAccPass+"/accDetails"),{
        name: rAccName,
        avalBal: 0
    }).then(()=>{
        alert("Registered");

    }).catch((error)=>{
        alert("Register Failed\n"+error);

    });

    set(ref(db,"accNum "+rAccNum+"/received"),{
        receivedAmount: 0
    }).then(()=>{
        console.log("User Registered Successfully");
    }).catch((error)=>{
        alert("User Registration Failed\n"+error);
    });



}else{
    alert("Please Enter Valid Info");
}
}


/* Pantalla de Inicio */

function portal (accNum,accPass){
    document.getElementById('login-menu').style = "display:none"
    document.getElementById('register-menu').style = "display:none"
    document.getElementById('portal').style = "display:inline-block"

    var name,avalBal,totalBal,receivedAmount,msg;
    

/* Codigo para Extraer informacion de la Base de Datos */

get(child(dbref,"accNum "+accNum+"/accPass "+accPass+"/accDetails")).then((snapshot)=>{
    if(snapshot.exists()){
        name = snapshot.val().name;
        avalBal = snapshot.val().avalBal;
        document.getElementById('userName').innerHTML = 'Hi '+name;

    }else{
        alert("No Data Found In The Database");
    }

}).catch((error)=>{
    alert("Error While Getting Data\n"+error);
});

get(child(dbref,"accNum "+accNum+"/received")).then((snapshot)=>{
    if(snapshot.exists()){
        receivedAmount = snapshot.val().receivedAmount;
        totalBal = avalBal + receivedAmount;
        msg = "Hi, "+name;
        updateAvalBal(msg,totalBal);
        updateReceivedAmount();

    }else{
        console.log("No Received Amount Found In The Database");
    }

}).catch((error)=>{
    alert("Error While Getting Data\n"+error);
}); 

/* Trigger para Actualizar Base de Datos  */
    
function updateAvalBal(msg,totalBal){
    update(ref(db,"accNum "+accNum+"/accPass "+accPass+"/accDetails"),{
        avalBal: totalBal
    }).then(()=>{
        alert(msg);
        document.getElementById('totalBal').innerHTML = 'Total Balance: '+totalBal;

    }).catch((error)=>{
        alert("error\n"+error);
    });
}
     function updateReceivedAmount(){
        update(ref(db,"accNum "+accNum+"/received"),{
            receivedAmount: 0
        }).then(()=>{
            console.log("Received Amount Updated");

        }).catch((error)=>{
            alert("error\n"+error);
        });
} 

/* Funciones para Depositar $$$ a la Cuenta */

document.getElementById('deposit-btn').addEventListener('click',deposit);

function deposit(){
 document.getElementById('deposit-menu').style = "display:inline-block";
 document.getElementById('withdraw-menu').style = "display:none";
 document.getElementById('transfer-menu').style = "display:none";

document.getElementById('deposit-submit').addEventListener('click',function(){
 var depositAmount = Number(document.getElementById('deposit-amount').value);
 if(depositAmount>=1){
    totalBal += depositAmount;
    document.getElementById('deposit-amount').value = '';
    msg = "$ "+depositAmount+" Was successfully deposited to your account";
    updateAvalBal(msg,totalBal);
 }else{
    alert('Minimum deposit amount $1')
 }
});
}

/* Funciones para Retirar $$$ a la Cuenta */

document.getElementById('withdraw-btn').addEventListener('click',withdraw);

function withdraw(){
 document.getElementById('deposit-menu').style = "display:none";
 document.getElementById('withdraw-menu').style = "display:inline-block";
 document.getElementById('transfer-menu').style = "display:none";

document.getElementById('withdraw-submit').addEventListener('click',function(){
 var withdrawAmount = Number(document.getElementById('withdraw-amount').value);
 if(withdrawAmount>=1){
    totalBal -= withdrawAmount;
    document.getElementById('withdraw-amount').value = '';
    msg = "$ "+withdrawAmount+" Was successfully withdraw from your account";
    updateAvalBal(msg,totalBal);
 }else{
    alert('Minimum withdraw amount $1')
 }
});
}

/* Funciones para boton de Regreso */

document.getElementById('back-btn').addEventListener('click',back);

function back(){
    document.getElementById('deposit-menu').style = "display:none";
    document.getElementById('withdraw-menu').style = "display:none";
    document.getElementById('transfer-menu').style = "display:none";
    document.getElementById('portal').style = "display:inline-block";

}

}

}

