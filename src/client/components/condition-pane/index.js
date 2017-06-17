const React = require('react');
const s = require('./index.sass');
const {selectSearchCategory} = require('../../actions');
const {Icon, Breadcrumb, Dropdown} = require('semantic-ui-react');

function CategoryPath(props) {

  if (props.category) {

    const isLeaf = props.category && props.category.IsLeaf === 'true';
    const depthIndex = props.category ? Number(props.category.Depth) : -1;
    const parentCategory = depthIndex > 0 ? {
      name: props.category.CategoryPath.split(' > ')[depthIndex - 1],
      id: props.category.ParentCategoryId
    } : null;
    return (<Breadcrumb>

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
    </Breadcrumb>);

  } else {
    return <div></div>;
  }
}

function QueryKeywords(props) {
  return (
      <input className={s.queryKeywordsInput} placeholder="商品のキーワード" />
  )
}

module.exports.default = function ConditionPane(props) {
  return (
      <div className={s.root}>
        <CategoryPath {...props}/>
        <QueryKeywords {...props}/>
      </div>
  );
};

