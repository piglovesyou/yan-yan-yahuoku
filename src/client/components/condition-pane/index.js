const React = require('react');
const s = require('./index.sass');
const {selectSearchCategory, executeQueryWithKeywords} = require('../../actions');
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

class ConditionPane extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      queryKeywordsInputValue: this.props.lastQueryKeywords,
    };
  }

  render() {
    return (
        <div className={s.root}>
          <form onSubmit={onSubmit.bind(this)}>
            <CategoryPath {...this.props}/>
            <input ref="queryKeywordsInput"
                   className={s.queryKeywordsInput}
                   placeholder="商品のキーワード"
                   value={this.state.queryKeywordsInputValue}
                   onChange={(e) => this.setState({
                    queryKeywordsInputValue: e.target.value,
                   })}
            />
          </form>
        </div>
    );
  }
}
module.exports.default = ConditionPane;

function onSubmit(e) {
  executeQueryWithKeywords(this.refs.queryKeywordsInput.value);
  e.preventDefault();
}
