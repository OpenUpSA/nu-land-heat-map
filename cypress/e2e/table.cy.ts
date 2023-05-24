describe("table view spec", () => {
  it("passes", () => {
    cy.visit("/table-view.html?property=Owner type&selected=NONE").contains('Total Rows');
  });
});
