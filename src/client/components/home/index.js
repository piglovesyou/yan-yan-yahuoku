const React = require('react');
const s = require('./index.sass');
const {Breadcrumb, Dropdown} = require('semantic-ui-react');
const {selectSearchCategory} = require('../../actions');

module.exports.default = function Home(props) {
  const isLeaf = props.category && props.category.IsLeaf === 'true';
  const depthIndex = props.category ? Number(props.category.Depth) : -1;
  const parentCategory = depthIndex > 0 ? {
    name: props.category.CategoryPath.split(' > ')[depthIndex - 1],
    id: props.category.ParentCategoryId
  } : null;

  return (
      <div className={s.root}>
        <h2>Home...</h2>
        <div>
          {props.category
              ? (
                  <Breadcrumb>

                    {
                      parentCategory ? (
                          <Breadcrumb.Section link
                                              onClick={() => selectSearchCategory(parentCategory.id)}
                          >{parentCategory.name}</Breadcrumb.Section>
                      ) : null
                    }

                    {parentCategory ? <Breadcrumb.Divider icon='right angle'/> : null }

                    <Breadcrumb.Section>
                      {
                        isLeaf ? props.category.CategoryName
                            : (
                            <Dropdown text={props.category.CategoryName}>
                              <Dropdown.Menu className={s.dropdownMenu}>
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
                        )
                      }
                    </Breadcrumb.Section>

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
