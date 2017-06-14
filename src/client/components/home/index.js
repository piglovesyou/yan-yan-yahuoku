const React = require('react');
const s = require('./index.sass');
const {Breadcrumb, Dropdown} = require('semantic-ui-react');
const {selectSearchCategory} = require('../../actions');

module.exports.default = function Home(props) {
  const isLeaf = props.category && props.category.IsLeaf === 'true';

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

                    {!isLeaf && <Breadcrumb.Divider icon='right angle'/>}

                    {!isLeaf && <Breadcrumb.Section>
                      <Dropdown text='(下位カテゴリを選択)'>
                        <Dropdown.Menu>
                          {props.category.ChildCategory.map(c => {
                            return <Dropdown.Item key={c.CategoryId}
                                                  text={c.CategoryName}
                                                  value={c.CategoryId}
                                                  onClick={(e, item) => {
                                                    selectSearchCategory(item.value);
                                                  }}
                            />;
                          })}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Breadcrumb.Section>
                    }
                  </Breadcrumb>
              ) : null
          }

        </div>
        <div><a href="/api/openWatchList?start=1">/api/openWatchList?start=1</a></div>
        {/*<h3>Messages <Button onClick={baam}>Add message</Button></h3>*/}
        {/*<ul>*/}
          {/*{props.messages.map((m, i) => <li key={i}>{m}</li>)}*/}
        {/*</ul>*/}
      </div>
  );
};
