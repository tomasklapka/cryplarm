
function ticker() {
  const ticking = document.getElementById("liveMode").checked;
  if (ticking) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const js = JSON.parse(this.responseText);
        document.getElementById("last_price").innerHTML = js.last_price;
        document.getElementById("alarms_list_up").innerHTML = js.alarms_list_up;
        document.getElementById("alarms_list_down").innerHTML = js.alarms_list_down;
        const field = document.getElementById("alarmPrice");
        if (!field.value || !field.value > 0) {
          field.value = js.last_price;
        }
      }
    };
    xhttp.open("GET", "/ticker", true);
    xhttp.send();
  }
}

function start_ticking() {
  ticker();
  setInterval(ticker, 5000);
}

function adjust(change) {
  const field = document.getElementById("alarmPrice");
  if (!field.value || !+field.value > 0) {
    field.value = 0;
  }
  let newval = +field.value;
  field.value = newval + change;
  if (!field.value || !+field.value > 0) {
    field.value = 0;
  }
}

window.onload = start_ticking
