function openForm() {
        document.getElementById("login-overlay").style.display ="block";
        document.querySelector(".black-background").style.display="block";
        document.querySelector("body").style.overflow="hidden";
}

function closeForm(){
        document.querySelector("body").style.overflow="auto";
        document.querySelector(".black-background").style.display="none";
        document.getElementById("login-overlay").style.display="none";
}