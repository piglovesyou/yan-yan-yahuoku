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

          <p>
            ヤンヤンヤフオクは、より効率よくヤフオクを巡回するためのWebサービスです。
          </p>
          <ul>
            <li>大きく見やすい商品画像を表示します。より多くの商品を正確にチェックすることができます。</li>
            <li>表示が速いです。素早くリストと商品詳細を行き来できるため、より多くの商品をチェックすることができます。</li>
            <li>[実装予定] <strike>ウォッチしなかった商品を、次から表示しません。新着の商品を中心に効率よくチェックできます。</strike></li>
            <li>[実装予定] <strike>ウォッチリストも素早く確認できます。</strike></li>
          </ul>
          <p>ヤンヤンヤフオクは、<a href="https://twitter.com/takamura_so">私</a>が特定のカテゴリの新着商品を効率的に巡回するために作られました。あなたにも役立つよう作ったつもりですが、万が一損害を与えてしまっても私は一切責任を取りません。</p>

          <p>
            <a href="https://developer.yahoo.co.jp/about">
              <img src="https://s.yimg.jp/images/yjdn/yjdn_attbtn1_125_17.gif" title="Webサービス by Yahoo! JAPAN"
                   alt="Web Services by Yahoo! JAPAN"
                   className={s.yapiLinkImg}/>
            </a>
          </p>
          <p>ヤンヤンヤフオクはYahoo! オークションWeb API を利用して作られました。</p>

        </div>
      </div>
  );
};
