import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAmwJkuxoy2JEUbHzSAL7SQnuGOjWQ71FQ",
  authDomain: "sinavtakip-24a93.firebaseapp.com",
  databaseURL: "https://sinavtakip-24a93-default-rtdb.firebaseio.com",
  projectId: "sinavtakip-24a93",
  storageBucket: "sinavtakip-24a93.appspot.com",
  messagingSenderId: "640235953301",
  appId: "1:640235953301:web:a727fa13351c1460914f9c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
let quizs;

//!quiz girişinde grup adını select yapısını yazdırdım
// document.addEventListener("DOMContentLoaded", function () {
//   let filterGrup = document.querySelector(".filterGrup");
//   const db = getDatabase();
//   const countRef = ref(db, "gruplar/");
//   onValue(countRef, (snapshot) => {
//     let data = Object.keys(snapshot.val());
//     for (const i of data) {
//       filterGrup.innerHTML += `
//             <option>${i}</option>
//         `;
//     }
//   });
// });

const db = getDatabase();





// const db = getDatabase();
// const countRefOgrenci = ref(db, "sinavlar/");
// onValue(countRefOgrenci, (snapshot) => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const quizId = urlParams.get("id");
//   let data = snapshot.val();
//   // console.log(data,quizId);


//   questionsArray = Object.keys(data).map((key, index) => {
//     return {
//       id: index,
//       ...data[key],
//     };
//   });
//   // console.log(questionsArray,quizId);
// });




//!tıklanılan quizin adını aldım
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");
let questionsArray
const countRef = ref(db, "sinavlar/");
onValue(countRef, (snapshot) => {
  let data = snapshot.val();
  // console.log(data);
  questionsArray = Object.keys(data).map((key, index) => {
    return {
      id: index,
      ...data[key],
    };
  });

  //*hangi quizin geleceği filtreledim
  const quizDetail = questionsArray.find((value) => value.id == quizId);

  //*öğrenciye hangi quizi çözdüğünü disabled olarak inputda gösterdim
  // document.querySelector(".quizName").value = quizDetail.quizBilgi.name;

  //*quiz detayında gelen o quize ait bütün soruları obje haline çevirdim
  quizs = Object.values(quizDetail.sorular);
});

//!fonksiyon rastgele bir soru fırlatır
const rstGetQuiz = () => {
  let rstQuizIndex = Math.floor(Math.random() * quizs.length);
  let rstQuiz = quizs[rstQuizIndex];
  quizs.splice(rstQuizIndex, 1);
  return rstQuiz;
};

let ogrenciBilgileri = {};
let dogruSayi = 0;
let myinterval;

//!zamanlayıcı
function quizTimer() {
  const timerDiv = document.getElementById("timer");
  let dakika = 20;
  let saniye = 0;

  myinterval = setInterval(() => {
    if (dakika === 0 && saniye === 0) {
      clearInterval(myinterval);
      ogrenciBilgileri["sinavPuan"] = dogruSayi * 10;
      sinavSonucKayitEt()
      // console.log(ogrenciBilgileri);
      document.querySelector(".quizContent").style.display = "none";
      document.querySelector(".quizEndPoint").innerHTML = `Süren Bitti ${ogrenciBilgileri.ogrenciIsimSoyisim
        }! Toplam Puanın : ${dogruSayi * 10}`;
    } else {
      if (saniye === 0) {
        dakika--;
        saniye = 59;
      } else {
        saniye--;
      }
      const dakikaStr = dakika < 10 ? "0" + dakika : dakika;
      const saniyeStr = saniye < 10 ? "0" + saniye : saniye;
      timerDiv.textContent = dakikaStr + ":" + saniyeStr;
    }
  }, 10);
}

//!sınava başla butonu
document.querySelector(".quizNext").addEventListener("click", function () {
  // let quizName = document.querySelector(".quizName").value;
  // let quizStartNameSurName = document.querySelector(
  //   ".quizStartNameSurName"
  // ).value;
  // let filterGrup = document.querySelector(".filterGrup").value
  //*sınav başladığında zamanlayıcı başladı
  // quizTimer();

  //*objeye verileri atadım
  // ogrenciBilgileri["ogrenciIsimSoyisim"] = quizStartNameSurName;
  // ogrenciBilgileri["quizName"] = quizName;
  // ogrenciBilgileri["grupName"] = filterGrup;

  document.querySelector(".quizStart").style.display = "none";
  document.querySelector(".quiz").style.display = "block";

  let gelenSoru;
  //!yeni soru üretmesi için fonksiyon yazdım
  function yeniSoru() {
    //*rastgele sorular bittiğinde
    if (quizs.length == 0) {
      document.querySelector(".quizContent").style.display = "none";
      ogrenciBilgileri["sinavPuan"] = dogruSayi * 10;
      document.querySelector(".quizEndPoint").innerHTML = `Sınavın Bitti ${ogrenciBilgileri.ogrenciIsimSoyisim
        }! Toplam Puanın : ${dogruSayi * 10}`;
      //*bütün soruları zaman dolmadan çözerse time durduruldu!
      clearInterval(myinterval);
      sinavSonucKayitEt()
      console.log(ogrenciBilgileri);
      return;
    }
    gelenSoru = rstGetQuiz();
    console.log(gelenSoru);
    console.log(quizs);

    //*soru başlığını oluşturdum
    document.querySelector(".soru").innerHTML = gelenSoru.soru;

    //*her butonun içerisine veri tabanından gelen şıkları yerleştirdim
    let cevapButtons = document.querySelectorAll(".cevapButton");
    for (let i = 0; i < cevapButtons.length; i++) {
      cevapButtons[i].innerHTML = gelenSoru.cevaplar[i];
    }
  }
  yeniSoru();


  //!sıradaki soruyu aldım
  document.querySelector(".nextQuestion").addEventListener("click", function () {
    yeniSoru();
  })

  //!bütün cevap butonlarını aldım, tıklanılan butonun data-cevabını cevaplaya parametre olarak gönderdim
  //*burada öğrencinin bastığı butonun data-indexine göre doğru cevap karşılatırılmasını yaptım
  const cevapButtons = document.querySelectorAll(".cevapButton");
  cevapButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const cevapIndex = parseInt(button.dataset.cevap, 10);
      cevapla(cevapIndex);
    });
  });

  //!öğrenci cevap verdiğinde tıkladığı butonun data-cevap verisini alıp karşılaştırdım
  function cevapla(cevapIndex) {
    if (cevapIndex === gelenSoru.dogruCevap) {
      dogruSayi++;
    }
    yeniSoru();
  }
});


//!öğrencilerin sınav sonuçlarını kayıt ettim
function sinavSonucKayitEt(){
  console.log("quiz bilgileri : ",questionsArray);
  onAuthStateChanged(auth, (user) => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get("id");
    const db = getDatabase();
    set(ref(db, 'ogrenciler/' + user.uid +  "/sinavlar/" + quizId + "/quizBilgi/"), {
      cozulduMu:true,
      name:questionsArray[quizId].quizBilgi.name,
      puan:ogrenciBilgileri.sinavPuan,
      quizContentBody:questionsArray[quizId].quizBilgi.quizContentBody,
      quizEtiket:questionsArray[quizId].quizBilgi.quizEtiket,
      quizCategory:questionsArray[quizId].quizBilgi.quizCategory
    })
  });
}



// function sinavSonucKayitEt() {

//   console.log(ogrenciBilgileri);
//   const db = getDatabase();
//   set(ref(db, 'ogrenciler/' + ogrenciBilgileri.ogrenciIsimSoyisim + " " + ogrenciBilgileri.quizName), {
//     quizName: ogrenciBilgileri.quizName,
//     quizStartNameSurName: ogrenciBilgileri.ogrenciIsimSoyisim,
//     sinavSonuc: ogrenciBilgileri.sinavPuan,
//     grupName: ogrenciBilgileri.grupName
//   })
// }


//!sayfa yenilendiğinde soru soruyorum!
//*sayfanın yenilenme durumunda herhangi bir kayıt olmuyor, yenilenme iptal edildiğinde sınav kaldığı yerden devam ediyor
// window.onbeforeunload = function () {
//   return "Sayfayı yenilemek istediğinizden emin misiniz?";
// }


//!öğrencinin daha önceden sınava girip girmediğini baktım
//*öğrenci sınava girmişse ana sayfaya yönlendirme yaptım
document.addEventListener("DOMContentLoaded", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Kullanıcı oturum açmışsa devam edin
      const urlParams = new URLSearchParams(window.location.search);
      const quizId = +urlParams.get("id");
      const db = getDatabase();
      const countRef = ref(db, "ogrenciler/" + user.uid + "/sinavlar/" + quizId);

      // Veriyi tek seferde çekiyoruz
      //*get burada sadece bir kez veriyi dinledi
      get(countRef).then((snapshot) => {
        const data = snapshot.val();
        console.log(data);
        if (data.quizBilgi.cozulduMu == true) {
          document.body.innerHTML = `
            <h2>Çözülmüş Quiz!</h2>
            <a href="index.html">Ana Sayfa</a>
          `;
        }
      });
    } else {
      console.log("Kullanıcı oturum açmamış.");
    }
  });
});

