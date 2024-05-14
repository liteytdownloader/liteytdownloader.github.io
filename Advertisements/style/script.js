(function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  
  if (check) {
	document.body.className = "mobile";
  }
})();

var _dataJSON = null, _activeChannels = null, _chanInputs = null, _finishedLoading = false;

function AppendUpdateTime(theContainer, jsondata) {
	if ('Update' in jsondata) {
		let theDate = new Date(jsondata.Update);
		let showString = "بروزرسانی شده: " + theDate.toLocaleTimeString('fa-IR') + " - " + theDate.toLocaleDateString('fa-IR');
		
		let timeElement = document.createElement("div");
		timeElement.className = "timeDiv";
		timeElement.innerHTML = '<div class="spinner-grow"><span class="visually-hidden">Loading..</span></div> ' + showString;
		theContainer.appendChild(timeElement);	
	}
}

function parseJSONData(jsondata, activechannel, isoffline) {
	localStorage.setItem("activeCHN", JSON.stringify(activechannel));

	_activeChannels = activechannel;
	if (jsondata != null) {
		_dataJSON = jsondata;
		localStorage.setItem("jsonData", JSON.stringify(_dataJSON));
	}
	else {
		jsondata = _dataJSON;
	}
	
	let theContainer = document.querySelector(".container");
	theContainer.innerHTML = "";
	
	if (jsondata.length > 4) {
		AppendUpdateTime(theContainer, jsondata[4]);
	}
	
	let maxPos = FindStopLength(jsondata, activechannel);
	
	for (let i = 0, j = maxPos/*jsondata[0].length*/; i < j; i++) {
		let currentDay = i;
		
		let data1 = jsondata[1][currentDay], // aramish
		data2 = jsondata[2][currentDay], // qoran
		data3 = jsondata[3][currentDay], // adrin
		data4 = jsondata[0][currentDay]; // shadkonak
		
		if (!activechannel[5] && IsDateOld(data1.Date)) {
			continue;
		}
		
		let dayElement = document.createElement("div");
		dayElement.className = "day";
		dayElement.innerHTML = '<div class="title"><i class="fa-solid fa-calendar-days"></i> ' + data1.Day + '<span class="date">' + data1.Date + '</span></div>';
		
		
		for (let a = 0; a < 3; a++) {
			let reservedAds = null, ad1, ad2;
			if (activechannel[1] || activechannel[2] || activechannel[3]) {
				reservedAds = document.createElement("div");
				reservedAds.className = "ReservedAds";
				
				let theTime = " ۱۰:۳۰ صبح";
				if (a == 1) {
					theTime = " ۱۷ عصر";
				}
				else if (a == 2) {
					theTime = " ۲۲ شب";
				}
				reservedAds.innerHTML = '<div class="time"><i class="fa-solid fa-alarm-clock fa-lg"></i>' + theTime + '</div>';
				
				// aramish
				if (activechannel[1]) {
					ad1 = jsondata[1][currentDay].Ads[a][0];
					ad2 = jsondata[1][currentDay].Ads[a][1];
					AppendAdData("Aramish", ad1, 0, reservedAds, activechannel);
					AppendAdData("Aramish", ad2, 1, reservedAds, activechannel);
				}
				
				// quran
				if (activechannel[2]) {
					ad1 = jsondata[2][currentDay].Ads[a][0];
					ad2 = jsondata[2][currentDay].Ads[a][1];
					AppendAdData("Quran", ad1, 0, reservedAds, activechannel);
					AppendAdData("Quran", ad2, 1, reservedAds, activechannel);
				}
				
				// adrin
				if (activechannel[3]) {
					ad1 = jsondata[3][currentDay].Ads[a][0];
					ad2 = jsondata[3][currentDay].Ads[a][1];
					AppendAdData("Adrin", ad1, 0, reservedAds, activechannel);
					AppendAdData("Adrin", ad2, 1, reservedAds, activechannel);
				}
			}
			
			if (a == 2 && activechannel[0]) {
				if (reservedAds == null) {
					reservedAds = document.createElement("div");
					reservedAds.className = "ReservedAds";				
					reservedAds.innerHTML = '<div class="time"><i class="fa-solid fa-alarm-clock fa-lg"></i> ۲۲ شب</div>';
				}
				
				ad1 = jsondata[0][currentDay].Ads[a][0];
				ad2 = jsondata[0][currentDay].Ads[a][1];
				AppendAdData("Shad", ad1, 0, reservedAds, activechannel);
				AppendAdData("Shad", ad2, 1, reservedAds, activechannel);
			}
			
			if (reservedAds != null && !reservedAds.innerText.includes("مطلب"))
				reservedAds.appendChild(EmptyDay());
				
			if (reservedAds != null)
				dayElement.appendChild(reservedAds);			
			
			// 12 am
			if (a != 2 && activechannel[0]) {
				reservedAds = document.createElement("div");
				reservedAds.className = "ReservedAds";
				
				let theTime = " ۱۲ ظهر";
				if (a == 1) {
					theTime = " ۱۸ عصر";
				}
				reservedAds.innerHTML = '<div class="time"><i class="fa-solid fa-alarm-clock fa-lg"></i>' + theTime + '</div>';
				
				// shadkoonak
				ad1 = jsondata[0][currentDay].Ads[a][0];
				ad2 = jsondata[0][currentDay].Ads[a][1];
				AppendAdData("Shad", ad1, 0, reservedAds, activechannel);
				AppendAdData("Shad", ad2, 1, reservedAds, activechannel);
			}
			else {
				reservedAds = null;
			}
				
			if (reservedAds != null && !reservedAds.innerText.includes("مطلب"))			
				reservedAds.appendChild(EmptyDay());
			
			if (reservedAds != null)
				dayElement.appendChild(reservedAds);
				
			
		}
		theContainer.appendChild(dayElement);
	}
	GoToTodaysDate(isoffline);
}

function AppendAdData(channel, adname, adtype, reservedAds, showReserved) {
	if (adname.length > 0) {
		if (!showReserved[4])
			return;
		if (adtype == 0) {
			reservedAds.innerHTML += '<div onclick="CopyMe(0, this)" class="' + channel + ' AdItem">یک مطلب مانده به آخر<div style="text-align: center"><i class="fa-solid fa-flag-swallowtail"></i> رزرو شده، موضوع: ' + adname + '</div></div>';
		}
		else {
			reservedAds.innerHTML += '<div onclick="CopyMe(1, this)" class="' + channel + ' AdItem">آخرین مطلب ارسالی<div style="text-align: center"><i class="fa-solid fa-flag-swallowtail"></i> رزرو شده، موضوع: ' + adname + '</div></div>';
		}
	}
	else {
		if (adtype == 0) {
			
			reservedAds.innerHTML += '<div onclick="CopyMe(0, this)" class="' + channel + ' AdItem">یک مطلب مانده به آخر<div style="text-align: center"><i class="fa-duotone fa-circle-check"></i> رزرو نشده</div></div>';
		}
		else {
			reservedAds.innerHTML += '<div onclick="CopyMe(1, this)" class="' + channel + ' AdItem">آخرین مطلب ارسالی<div style="text-align: center"><i class="fa-duotone fa-circle-check"></i> رزرو نشده</div></div>';
		}
	}
}


(function() {
	let jsonData = localStorage.getItem("jsonData");
	if (jsonData == null) {
		jsonData = [[],[],[],[]];
	}
	else {
		jsonData = JSON.parse(jsonData);
	}
	
	PrepareDataToUser(jsonData, true);
})();

function PrepareDataToUser(jsonData, isoffline) {
	let acticeCHN = [true, false, false, false, false, false];
	let activeCache = localStorage.getItem("activeCHN");
	if (activeCache != null) {
		acticeCHN = JSON.parse(activeCache);
	}
	
	if (isoffline) {
		let url = new URL(window.location.href);
		let c = url.searchParams.get("c");
		if (c == 0) {
			acticeCHN[0] = true;
			acticeCHN[1] = false;
			acticeCHN[2] = false;
			acticeCHN[3] = false;
		}
		else if (c == 1) {
			acticeCHN[0] = false;
			acticeCHN[1] = true;
			acticeCHN[2] = false;
			acticeCHN[3] = false;
		}
		else if (c == 2) {
			acticeCHN[0] = false;
			acticeCHN[1] = false;
			acticeCHN[2] = true;
			acticeCHN[3] = false;
		}
		else if (c == 3) {
			acticeCHN[0] = false;
			acticeCHN[1] = false;
			acticeCHN[2] = false;
			acticeCHN[3] = true;
		}
	}
	
	FixActivationLayout(acticeCHN);
	
	parseJSONData(jsonData, acticeCHN, isoffline);
	
	if (isoffline) {
		loadUpdatedData();
	}
}

function FixActivationLayout(ActiveChannels) {
	if (_chanInputs == null) {
		_chanInputs = document.querySelectorAll("input");
	}
	
	_chanInputs[0].checked = ActiveChannels[0];
	_chanInputs[2].checked = ActiveChannels[1];
	_chanInputs[1].checked = ActiveChannels[2];
	_chanInputs[3].checked = ActiveChannels[3];
	_chanInputs[4].checked = ActiveChannels[4];
	_chanInputs[5].checked = ActiveChannels[5];
}

function ShowFilteredAds(trigger) {
	if (!_finishedLoading) {
		trigger.checked = !trigger.checked;
		return;
	}

	if (_chanInputs == null) {
		_chanInputs = document.querySelectorAll("input");
	}
	
	let activeChannelsList = [_chanInputs[0].checked, _chanInputs[2].checked, _chanInputs[1].checked, _chanInputs[3].checked, _chanInputs[4].checked, _chanInputs[5].checked];
	
	if (!activeChannelsList[0] &&
		!activeChannelsList[1] &&
		!activeChannelsList[2] &&
		!activeChannelsList[3]) {
		trigger.checked = true;
		
		activeChannelsList = [_chanInputs[0].checked, _chanInputs[2].checked, _chanInputs[1].checked, _chanInputs[3].checked, _chanInputs[4].checked, _chanInputs[5].checked];
	}
	
	
	if (PerformeFadeEffect(activeChannelsList)) {
		setTimeout(function() {
			parseJSONData(null, activeChannelsList, false);
		}, 205);
	}
	else {
		parseJSONData(null, activeChannelsList, false);
	}
}

function PerformeFadeEffect(ActiveChannelsList) {
	let fadingAny = false;
	if (!ActiveChannelsList[0]) {
		document.querySelectorAll(".Shad.AdItem").forEach(function(item) {
			item.style.opacity = "0";
			fadingAny = true;
		});
	}
	
	if (!ActiveChannelsList[1]) {
		document.querySelectorAll(".Aramish.AdItem").forEach(function(item) {
			item.style.opacity = "0";
			fadingAny = true;
		});
	}
	
	if (!ActiveChannelsList[2]) {
		document.querySelectorAll(".Quran.AdItem").forEach(function(item) {
			item.style.opacity = "0";
			fadingAny = true;
		});
	}
	
	if (!ActiveChannelsList[3]) {
		document.querySelectorAll(".Adrin.AdItem").forEach(function(item) {
			item.style.opacity = "0";
			fadingAny = true;
		});
	}

	return fadingAny;
}

function CopyMe(type, element) {
	let time = element.parentNode.querySelector(".time").innerText,
		date = FixDateString(element.parentNode.parentNode.querySelector(".title").innerText);
	
	date = getHowManyDays(date);
	
	let findChannel = element.className, adPosition = "آخرین مطلب ارسالی (جایگاه اول)";
	if (type == 0) {
		adPosition = "یک مطلب مانده به آخر (جایگاه دوم)";
	}
	
	let adPrice = CalculateAdPrice(findChannel, type, time, date);
	
	if (findChannel.includes("Shad")) {
		findChannel = "شادکنک - @ShadKoonak";
	}
	else if (findChannel.includes("Aramish")) {
		findChannel = "صدای آرامش - @AramishVoice";
	}
	else if (findChannel.includes("Quran")) {
		findChannel = "انس با قرآن - @SedayeVahy";
	}
	else if (findChannel.includes("Adrin")) {
		findChannel = "آدرین موزیک - @AdrinMusic";
	}
	
	let takeText = "📅 " + date + "\r\n\r\n⏰ ساعت:" + time + "\r\n📣 کانال: " + findChannel + "\r\n📌 جایگاه: " + adPosition + "\r\n💶 قیمت: " + adPrice + "\r\n\r\nℹ️ بنر شما از ساعت" + time;
	
	if (findChannel.includes(' -'))
		findChannel = findChannel.substr(0, findChannel.indexOf(' -'));
	
	takeText += " تا ساعت " + FindNextTime(time, findChannel) + " " + adPosition + " کانال " + findChannel + " خواهد بود. بعد از آن تبلیغ شما پست آزاد می‌شود، بنر ۲۴ ساعت بعد از قرار گرفتن در کانال حذف می‌شود.";
	
	CopyTheText(takeText);
	
	let oldClass = element.className.replace(" highlightFilled", "").replace(" highlight", "");
	
	if (element.innerText.includes("رزرو شده")) {
		element.className = oldClass + " highlightFilled";
	}
	else {
		element.className = oldClass + " highlight";
	}
	
	setTimeout(function() {
		element.className = oldClass;
	}, 1000);
}

function getHowManyDays(date) {
	let dateData = date.split(' - ');
	if (dateData.length == 2) {
		let targetDate = CalculateDate(dateData[1]);
		
		let curDate = Date.now();
		let howManyDates = 0;
		
		while (true) {
			let generateDate = new Date(curDate);
			let curDateINT = CalculateDate(generateDate.toLocaleDateString('fa-IR'));
			console.log(curDateINT);
			if (curDateINT > targetDate) {
				curDate -= (24 * 60 * 60 * 1000);
				howManyDates--;
			}
			else if (curDateINT < targetDate) {
				curDate += (24 * 60 * 60 * 1000);
				howManyDates++;
			}
			else {
				break;
			}
		}
		
		let dayString = "امروز";
		if (howManyDates < 0) {
			if (howManyDates == -1) {
				dayString = "دیروز";
			}
			else if (howManyDates == -2) {
				dayString = "پریروز";
			}
			else {
				dayString = ConvertEnglishToPersian(Math.abs(howManyDates).toString()) + " روز قبل";
			}
		}
		else if (howManyDates > 0) {
			if (howManyDates == 1) {
				dayString = "فردا";
			}
			else if (howManyDates == 2) {
				dayString = "پس فردا";
			}
			else {
				dayString = ConvertEnglishToPersian(Math.abs(howManyDates).toString()) + " روز بعد";
			}
		}
		
		if (dayString.length > 0) {
			 return dateData[0] + " (" + dayString + ") - " + dateData[1];
		}
	}
	return date;
}

function CalculateAdPrice(channelName, adPosition, adTime, theDate) {
	let targetDate = CalculateDate(theDate.substr(theDate.indexOf('۱۴۰'))),
		discountTill = 14030121;
	
	let thePrice = "PRICE";
	
	//console.log("targetDate: " + theDate.substr(theDate.indexOf('۱۴۰')));
	
	let disCountApplies = (discountTill >= targetDate), isNight = adTime.includes("شب");
	
	//console.log("disCountApplies: " + disCountApplies + " | isNight: " + isNight);
	
	if (channelName.includes("Shad") || channelName.includes("Adrin")) {
		if (adPosition == 0) {
			thePrice = "۱۵۰،۰۰۰";
		}
		else {
			if (isNight) {
				thePrice = "۲۵۰،۰۰۰";
			}
			else {
				thePrice = "۲۰۰،۰۰۰";
			}
		}
	}
	else if (channelName.includes("Aramish") || channelName.includes("Quran")) {
		if (adPosition == 0) {
			if (isNight) {
				if (disCountApplies) {
					thePrice = "۱۸۰،۰۰۰";
				}
				else {
					thePrice = "۲۰۰،۰۰۰";
				}
			}
			else {
				if (disCountApplies) {
					thePrice = "۱۵۰،۰۰۰";
				}
				else {
					thePrice = "۱۸۰،۰۰۰";
				}
			}
		}
		else {
			if (isNight) {
				if (disCountApplies) {
					thePrice = "۲۸۰،۰۰۰";
				}
				else {
					thePrice = "۳۰۰،۰۰۰";
				}
			}
			else {
				if (disCountApplies) {
					thePrice = "۲۲۰،۰۰۰";
				}
				else {
					thePrice = "۲۵۰،۰۰۰";
				}
			}
		}
	}
	return thePrice + " تومان";
}

function FindNextTime(curtime, channlName) {
	if (curtime.includes("۱۰:۳۰")) {
		return "۱۷ عصر";
	}
	else if (curtime.includes("۱۲")) {
		return "۱۸ عصر";
	}
	else if (curtime.includes("۱۷") || curtime.includes("۱۸")) {
		return "۲۲ شب";
	}
	else if (curtime.includes("۲۲") && channlName.includes("شادکنک")) {
		return "۱۲ ظهر";
	}
	else if (curtime.includes("۲۲")) {
		return "۱۰:۳۰ صبح";
	}
	else {
		return "نمیدانم";
	}
}

function FixDateString(date) {
	let where = date.indexOf('\r'), where2 = date.indexOf('\n');
	
	if (where != -1 && where2 != -1) {
		return date.replace("\r\n", " - ");
	}
	else if (where != -1) {
		return date.replace("\r", " - ");
	}
	else if (where2 != -1) {
		return date.replace("\n", " - ");
	}
	else {
		return date;
	}
}

function CopyTheText(text) {
	let copyText = document.createElement("textarea");
	copyText.style.position = "fixed";
	copyText.style.width = "0px";
	copyText.style.height = "0px";
	
	document.body.appendChild(copyText);
	
	copyText.value = text;
	
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	try
	{
		navigator.clipboard.writeText(copyText.value);
	}
	catch(msg) {
	
	}	
	document.execCommand('copy');
	
	copyText.remove();
}

function FocusOnToday(isoffline) {
	let todaysDate = new Date().toLocaleDateString('fa-IR').split('/');
	
	if (todaysDate[1].length < 2)
		todaysDate[1] = "۰" + todaysDate[1];
		
	if (todaysDate[2].length < 2)
		todaysDate[2] = "۰" + todaysDate[2];
		
	todaysDate = todaysDate[0] + "/" + todaysDate[1] + "/" + todaysDate[2];
	
	let availableDates = document.querySelectorAll("span.date");
	for (let i = 0, j = availableDates.length; i < j; i++) {
		if (availableDates[i].innerText == todaysDate) {	
			availableDates[i].parentNode.className = "title today";
			
			
			//availableDates[i].parentNode.parentNode.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
			
			let scrollTop = availableDates[i].parentNode.parentNode.offsetTop - 60;
			if (scrollTop < 0)
				scrollTop = 0;
			
			document.querySelector(".container").scroll({
			  top: scrollTop,
			  left: 0,
			  behavior: "smooth",
			});
			
			break;
		}
	}
	
	let isVisible = document.querySelector(".loaderContainer");
	if (!isoffline && isVisible!= null) {
		isVisible.style.opacity = 0;
		setTimeout(function() {
			isVisible.remove();
		}, 200);
	}
}

function GoToTodaysDate(isoffline) {
	setTimeout((function() { FocusOnToday(isoffline) }), 100);
}

function EmptyDay() {
	let theHandler = document.createElement("div");
	theHandler.className = "emptyreservs";
	theHandler.innerHTML = '<i class="fa-duotone fa-triangle-exclamation emptyiconStyle"></i> نوبت خالی وجود ندارد';
	return theHandler;
}

function loadUpdatedData() {
	if (typeof(JSHandler) != 'undefined') {
		let jsonResponse = JSHandler.getJson();
		if (jsonResponse == "null") {
			PrepareDataToUser(null, false);
		}
		else {
			PrepareDataToUser(JSON.parse(jsonResponse), false);
		}
		_finishedLoading = true;
	}
	else {
		fetch("https://ads.lxb.ir/post/100", {cache: "no-cache"}).then((response) => {
			if (response.ok) {
				response.text().then(resp =>
				{
					let startPos = resp.indexOf("["), finishPos = resp.indexOf("];", startPos);
					if (startPos != -1 && finishPos != -1) {
						finishPos++;
						let jsonData = JSON.parse(resp.substr(startPos, finishPos - startPos));
						
						PrepareDataToUser(jsonData, false);
					}
					
					_finishedLoading = true;
				});
			}
			else {
				PrepareDataToUser(null, false);
				_finishedLoading = true;
			}
		}).catch((msg) => {
			PrepareDataToUser(null, false);
			_finishedLoading = true;
		});
	}
}

var _todaysDateINT = null;
function IsDateOld(theDate) {
	if (_todaysDateINT == null) {
		_todaysDateINT = CalculateDate(new Date().toLocaleDateString('fa-IR'));
	}

	if (_todaysDateINT > CalculateDate(theDate)) {
		return true;
	}
	else {
		return false;
	}
}

function ConvertPersianToEnglish(input) {
	var persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g], arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]; 
	for(var i = 0; i < 10; i++)
	{
		input = input.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
	}
	return input;
}

function ConvertEnglishToPersian(input) {
	var persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'], englishNumbers  = [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g], arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]; 
	for(var i = 0; i < 10; i++)
	{
		input = input.replace(englishNumbers[i], persianNumbers[i]).replace(arabicNumbers[i], persianNumbers[i]);
	}
	return input;
}

function CalculateDate(input) {
	let theDate = ConvertPersianToEnglish(input).split('/');
	if (theDate.length != 3)
		return 0;
	
	if (theDate[1].length < 2)
		theDate[1] = "0" + theDate[1];
		
	if (theDate[2].length < 2)
		theDate[2] = "0" + theDate[2];
		
	return parseInt(theDate[0].toString() + theDate[1].toString() + theDate[2].toString());
}

function OpenSupport() {
	if (_chanInputs == null) {
		_chanInputs = document.querySelectorAll("input");
	}

	let activeChannelsCount = 0;
	for (let i = 0; i < 4; i++) {
		if (_chanInputs[i].checked)
			activeChannelsCount++;
	}
	
	if (activeChannelsCount > 0) {
		if (activeChannelsCount == 1) {
			if (_chanInputs[0].checked) {
				window.open("et://resolve?domain=tablighsupport", "eitaviewer");
			}
			else if (_chanInputs[2].checked) {
				window.open("et://resolve?domain=aramishsupport", "eitaviewer");
			}
			else if (_chanInputs[1].checked) {
				window.open("et://resolve?domain=sedayevahyadmin", "eitaviewer");
			}
			else if (_chanInputs[3].checked) {
				window.open("et://resolve?domain=tablighsupport", "eitaviewer");
			}
		}
		else {
			window.open("et://resolve?domain=tablighsupport", "eitaviewer");
		}
	}
	
	_chanInputs[0].checked, _chanInputs[2].checked, _chanInputs[1].checked, _chanInputs[3].checked
}

function FindStopLength(jsonData, activeChannel) {
	let stopIndex = -1;
	
	for (let a = 0; a < 4; a++) {
		if (activeChannel[a]) {
			for (let i = (jsonData[a].length - 1); i >= 0; i--) {
				if (jsonData[a][i].Ads[0][0].length > 0 || jsonData[a][i].Ads[0][1].length > 0 ||
				jsonData[a][i].Ads[1][0].length > 0 || jsonData[a][i].Ads[1][1].length > 0 ||
				jsonData[a][i].Ads[2][0].length > 0 || jsonData[a][i].Ads[2][1].length > 0) {
					let newStopIndex = (i + 1);
					if (stopIndex < newStopIndex) {
						stopIndex = newStopIndex;
					}
					break;
				}
			}
		}
	}
	
	if (stopIndex == -1) {
		stopIndex = jsonData[0].length;
	}
	return stopIndex;
}