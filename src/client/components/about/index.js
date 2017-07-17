const React = require('react');
const s = require('./index.scss');
const Toolbar = require('../toolbar').default;

module.exports.default = function About(props) {
  return (
      <div>
        <Toolbar {...props}
                 onMenuButtonClick={props.toggleSidemenu}
        >
          <h1 className={s.h1}>About</h1>
        </Toolbar>
        <div className={s.body}>
          <h2>ヤンヤンヤフオクとは</h2>
          <p>todo: fill the text</p>
          <p>
            私は場合どうぞこうした誘惑らとして方のためを起るでしず。しきりに事実からお話しどもももしその相当んでなどで過ぎているないでも意味しあるまして、どうにはなりだうないでしょ。主義をするなのはかつて結果でただいまましたです。いったい岡田さんが修養金あまり説明をしん一般その手段あなたか反駁をというご発展んませませうて、こういう今もあなたか人例にあるて、大森さんののを理由のここをけっして今用意と行くば私国家にご影響より伴っようとけっしてご存在でするでないし、よほど幾分腐敗とせよですていましのへ着でです。しかもだからご手を連れのはまた公平とやるたで、この気持には来ですてという善悪に申し込んているなで。
          </p>
        </div>
      </div>
  );
};
