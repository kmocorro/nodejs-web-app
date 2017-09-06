// SCRIPT
                    d3.json('/viewTarget.json', function (error,data) {

                        function tabulate(data, columns) {
                                var table = d3.select('body').append('table').attr("id","dg").attr("title", "Target Adjustment").attr("class", "easyui-datagrid").attr("style","max-width:100%;height:100%;").attr("toolbar", "#toolbar").attr("pagination","true").attr("rownumbers", "true").attr("fitColumns", "true").attr("singleSelect", "true")

                                var thead = table.append('thead')
                                var	tbody = table.append('tbody');

                                // append the header row
                                thead.append('tr')
                                .selectAll('th')
                                .data(columns).enter()
                                .append('th')
                                    .text(function (column) { return column; });

                                // create a row for each object in the data
                                var rows = tbody.selectAll('tr')
                                .data(data)
                                .enter()
                                .append('tr');

                                // create a cell in each row for each column
                                var cells = rows.selectAll('td')
                                .data(function (row) {
                                    return columns.map(function (column) {
                                    return {column: column, value: row[column]};
                                    });
                                })
                                .enter()
                                .append('td')
                                    .text(function (d) { return d.value; });

                            return table;
                            }

                            // render the table(s)
                            tabulate(data, ['process', 'start_time', 'end_time', 'num_tool', 'uph', 'oee', 'toolpm', 'target', 'remarks']); // 9 column table

                        });