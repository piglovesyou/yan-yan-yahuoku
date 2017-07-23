const React = require('react');
const s = require('./index.scss');
const {selectSearchCategory, loadFirstPage} = require('../../actions');
const {Icon, Breadcrumb, Dropdown} = require('semantic-ui-react');

class CategoryPath extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const category = this.props.category;

    if (category) {

      const isLeaf = category && category.IsLeaf === 'true';
      const depthIndex = category ? Number(category.Depth) : -1;
      const parentCategory = depthIndex > 0 ? {
        name: category.CategoryPath.split(' > ')[depthIndex - 1],
        id: category.ParentCategoryId
      } : null;

      return (
          <div className={s.categoryPath}>
            <Breadcrumb>

              {
                parentCategory ?
                    <div className={s.categoryPathParentCategory}>
                      <div className={s.categoryPathParentCategoryInner}>
                        <Breadcrumb.Section link
                                            onClick={() => selectSearchCategory(parentCategory.id)}
                        >{parentCategory.name}</Breadcrumb.Section>
                        <Breadcrumb.Divider icon='right angle'/>
                      </div>
                    </div> : null
              }

              <Breadcrumb.Section>
                {
                  isLeaf ? <Breadcrumb.Section>{category.CategoryName}</Breadcrumb.Section>
                      : (
                      <Dropdown text={category.CategoryName}>
                        <Dropdown.Menu className={s.dropdownMenu}>
                          {category.ChildCategory.map(c => {
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
          </div>
      );

    } else {
      return <div />;
    }
  }
}

class ConditionPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryKeywordsInputValue: this.props.lastQueryKeywords,
    };
  }

  render() {
    return (
        <div className={s.root}>
          <form className={s.form} onSubmit={onSubmit.bind(this)}>
            <CategoryPath {...this.props}/>
            {/*<Icon name="caret right"/>*/}
            <input type="search" ref="queryKeywordsInput"
                   className={s.queryKeywordsInput}
                   placeholder="検索キーワード"
                   value={this.state.queryKeywordsInputValue}
                   onChange={(e) => this.setState({
                     queryKeywordsInputValue: e.target.value,
                   })}
            />
            {/*<Icon name="favorite" style={{fontSize: '1.5rem'}}/>*/}
          </form>
        </div>
    );
  }
}
module.exports.default = ConditionPane;

function onSubmit(e) {
  loadFirstPage(this.refs.queryKeywordsInput.value);
  e.preventDefault();
}
