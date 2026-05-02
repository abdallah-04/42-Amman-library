/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const book = app.findCollectionByNameOrId("book");
  book.listRule = "";
  book.viewRule = "";
  book.createRule = "";
  book.updateRule = "";
  book.deleteRule = "";
  app.save(book);

  const borrow = app.findCollectionByNameOrId("borrow");
  borrow.listRule = "";
  borrow.viewRule = "";
  borrow.createRule = "";
  borrow.updateRule = "";
  borrow.deleteRule = "";
  app.save(borrow);
}, (app) => {
  const book = app.findCollectionByNameOrId("book");
  book.listRule = null;
  book.viewRule = null;
  book.createRule = null;
  book.updateRule = null;
  book.deleteRule = null;
  app.save(book);

  const borrow = app.findCollectionByNameOrId("borrow");
  borrow.listRule = null;
  borrow.viewRule = null;
  borrow.createRule = null;
  borrow.updateRule = null;
  borrow.deleteRule = null;
  app.save(borrow);
})
