const React = require('react');
const s = require('./index.sass');
const {Button, Breadcrumb, Dropdown} = require('semantic-ui-react');
const {baam} = require('../../actions');

module.exports.default = function Home(props) {

// countryOptions = [ { key: 'af', value: 'af', flag: 'af', text: 'Afghanistan' }, ...  ]
  return (
      <div className={s.root}>
        <h2>Home...</h2>
        <div>
          {props.category
              ? (
                  <Breadcrumb>
                    <Breadcrumb.Section>
                      {props.category.CategoryName}
                    </Breadcrumb.Section>

                    <Breadcrumb.Divider icon='right angle'/>

                    <Breadcrumb.Section>
                      <Dropdown text='(下位カテゴリを選択)'>
                        <Dropdown.Menu>
                          {props.category.ChildCategory.map(c => {
                            return <Dropdown.Item key={c.CategoryId}
                                                  text={c.CategoryName}
                                                  onClick={(e) => console.log(e)}
                            />;
                          })}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Breadcrumb.Section>
                  </Breadcrumb>
              ) : null
          }

        </div>
        <h3>Messages <Button onClick={baam}>Add message</Button></h3>
        <p><a href="/api/openWatchList?start=1">/api/openWatchList?start=1</a></p>
        <ul>
          {props.messages.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>
  );
};
