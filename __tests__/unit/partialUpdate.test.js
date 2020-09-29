const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("sqlForPartialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {

    // FIXME: write real tests!
    // partialUpdate (table, items, key, id)
    let table = "cats";
    let items = {"name": "Jorge", "age": 6};
    let key = "id";
    let id = "5";

    let expectedQuery = "UPDATE cats SET name=$1, age=$2 WHERE id=$3 RETURNING *";

    expect(sqlForPartialUpdate(table, items, key, id).query).toEqual(expectedQuery);
    expect(sqlForPartialUpdate(table, items, key, 5).query).toEqual(expectedQuery);
    expect(sqlForPartialUpdate(table, items, key, 5).values).toEqual(["Jorge", 6, 5]);


  });
});
