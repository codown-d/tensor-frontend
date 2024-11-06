#第一种方式添加table border 
给table添加class
#第二种方式添加table border 
给table组件添加bordered属性


/*第一种方式添加table border 给table添加class*/
.ant-table-wrapper.border {
  border-radius: 6px;
  border: 1px solid #eff0f2;
  overflow: hidden;

  .ant-table-thead tr th {
    color: #8e97a3;
    background: transparent;
  }

  .ant-table-tbody {
    tr {
      background: #fff;

      &:nth-child(even) {
        background: #fff;
      }
    }

    tr:last-of-type > td {
      border-bottom: 0px;
    }
  }
}
一会儿要一会儿不要的样式
/*第一种方式添加table border 给table添加class*/

/*第二种方式添加table border 给table添加border属性*/
.ant-table.ant-table-bordered > .ant-table-container {
  border: 1px solid #eff0f2;
  border-radius: 8px;
  overflow: hidden;

  .ant-table-thead tr th {
    height: 55px;
    padding-top: 19px;
    padding-left: 24px;
    background: transparent;
  }

  .ant-table-tbody {
    tr {
      background: transparent;
    }
  }

  & > .ant-table-content > table > tbody > tr > td,
  & > .ant-table-content > table > thead > tr > th {
    border-right: 0px;
  }

  .ant-table-tbody > tr:last-of-type > td {
    border-bottom: 0px;
  }
}

/*第二种方式添加table border 给table添加border属性*/
