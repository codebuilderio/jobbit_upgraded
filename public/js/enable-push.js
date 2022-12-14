initSW();

function initSW() {

    if (!"serviceWorker" in navigator) {
        //service worker isn't supported
        alert("sw not supported");
        return;
    }

    //don't use it here if you use service worker
    //for other stuff.
    if (!"PushManager" in window) {
        //push isn't supported
        alert("push not supported");
        return;
    }

    //register the service worker
if ('serviceWorker' in navigator) {

  window.addEventListener('load', function() {
  navigator.serviceWorker.register('https://jobbit.codebuilder.us/js/sw.js')
        .then(() => {
            initPush();
        })
        .catch((err) => {
            alert("wtf2")
            console.log(err)
        });
  });

  
    }
}

function initPush() {

    if (!navigator.serviceWorker.ready) {
        return;
    }

    new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    })
        .then((permissionResult) => {
            if (permissionResult !== 'granted') {
                throw new Error('We weren\'t granted permission.');
            }
            subscribeUser();

        });
}

function subscribeUser() {

    navigator.serviceWorker.ready
        .then((registration) => {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    'BFtuCXd1oztPZl+c7Vy0itWdU6DqNPH6ocJLSZ2Ide3vl5BdzoLvX8EXiOL7ocRfjEpiPJtLH7hUPbJiMFsm/uM='
                )
            };
            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then((pushSubscription) => {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            storePushSubscription(pushSubscription);
        });
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


function storePushSubscription(pushSubscription) {
    const token = document.querySelector('meta[name=csrf-token]').getAttribute('content');
    fetch('/push', {
        method: 'POST',
        body: JSON.stringify(pushSubscription),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        }
    })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.log(err)
        });
}

