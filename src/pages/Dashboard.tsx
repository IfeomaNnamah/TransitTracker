import Layout from "./Layout"

const Dashboard =  () => {
    const page = "Dashboard Analytics"
    // const Months = [
    //     "January",
    //     "February",
    //     "March",
    //     "April",
    //     "May",
    //     "June",
    //     "July",
    //     "August",
    //     "September",
    //     "October",
    //     "November",
    //     "December"
    //   ];
      
    // const data = {
    //     labels: Months,
    //     datasets: [{
    //         label: 'My First Dataset',
    //         data: [65, 59, 80, 81, 56, 55, 40, 73, 82, 71, 22, 12],
    //         borderColor: 'rgb(75, 192, 192)',
    //         tension: 0.1,
    //         borderWidth: 1,
    //         // fill: {value: 25}, // initiate area chart
    //         backgroundColor: 'rgb(75, 192, 192, .2)'
    //     },
    //     {
    //         label: 'My Second Dataset',
    //         data: [29, 58, 49, 28, 43, 24, 73,72, 67, 42, 13, 28, 22],
    //         borderColor: 'red',
    //         tension: 0.1,
    //         borderWidth: 1,
    //         // fill: {value: 25},
    //         backgroundColor: 'rgba(234, 1, 1, 0.2)'

    //     }]
    // };

    // const data1 = {
    //     labels: Months,
    //     datasets: [{
    //         // axis: 'y',
    //         type: "bar",
    //         label: 'My First Dataset',
    //         data: [65, 59, 80, 81, 56, 55, 10, 82, 42,49,92,82,32],
    //         backgroundColor: 'rgba(109, 23, 220, 0.2)',
    //         // 'rgba(234, 1, 1, 0.3)',
    //         // 'rgba(255, 159, 64, 0.3)',
    //         // 'rgba(255, 205, 86, 0.3)',
    //         // 'rgba(75, 192, 192, 0.3)',
    //         // 'rgba(54, 162, 235, 0.3)',
    //         // 'rgba(153, 102, 255, 0.3)',
    //         // 'rgba(201, 203, 207, 0.3)'
    //         // ],
    //         borderColor: 'rgba(109, 23, 220, 0.6)',
    //         // 'rgb(255, 99, 132)',
    //         // 'rgb(255, 159, 64)',
    //         // 'rgb(255, 205, 86)',
    //         // 'rgb(75, 192, 192)',
    //         // 'rgb(54, 162, 235)',
    //         // 'rgb(153, 102, 255)',
    //         // 'rgb(201, 203, 207)'
    //         // ],
    //         borderWidth: 1
    //     },
    //     {
    //         // axis: 'y',
    //         type: "line",
    //         label: 'My Second Dataset',
    //         data: [63,47,83,82,93,89,24,94,91,10,21,53,21],
    //         backgroundColor: 'rgba(234, 1, 1, 0.2)',
    //         borderColor: 'rgba(234, 1, 1, 0.6)',
    //         borderWidth: 1
    //     }]
    // };

    // const data2 = {
    //     labels: [
    //       'Red',
    //       'Blue',
    //       'Yellow'
    //     ],
    //     datasets: [{
    //       label: 'My First Dataset',
    //       data: [300, 50, 100],
    //       backgroundColor: [
    //         'rgb(255, 99, 132)',
    //         'rgb(54, 162, 235)',
    //         'rgb(255, 205, 86)'
    //       ],
    //       hoverOffset: 20
    //     }]
    //   };
    return (
        <Layout title={page}>
            <div className="container">
                <div className="main">
                    <h3 className="page_title">{  }</h3>     
                    <div className="main-inner" style={{minHeight: "100vh"}}> </div>

                    {/* <div className="grid-area">
                        <div className="header">header</div>
                        <div className="aside">sidebar</div>
                        <div className="content">content</div>
                        <div className="footer">footer</div>
                    </div>                  */}
                    
                    {/* <div className="grid-area">
                        <section className="header">
                            <select value="">
                                <option disabled value="">--</option>
                                {
                                    Months.map((month: string, index: number) => {
                                        return (
                                            <option key={index}>{month}</option>
                                        )
                                    })
                                }
                            </select>

                            <select value="2024">
                                {
                                    getYearToCurrentYear(2018).map((year: number, index: number) => {
                                        return (
                                            <option key={index}>{year}</option>
                                        )
                                    })
                                }
                            </select>
                        </section>
                        <div className="card1">
                            <div className="dashboard-card">
                                <div>
                                    <div className="yellow">
                                        <span className="material-symbols-rounded">other_admission</span>
                                        <p>Total MRDs Pending Assignment</p>
                                    </div>
                                </div>
                                <p>1,020</p>
                                <span className="red">
                                    <span className="material-symbols-rounded">arrow_downward</span>
                                    20% less than yesterday</span>
                            </div>
                        </div>
                        <div className="card2">
                            <div className="dashboard-card">
                                <div>
                                    <div className="blue">
                                        <span className="material-symbols-rounded">package_2</span>
                                        <p>Total MRDs Pending Pickup</p>
                                    </div>
                                </div>
                                <p>230</p>
                                <span className="green">
                                    <span className="material-symbols-rounded">arrow_upward</span>
                                    12% greater than yesterday</span>
                            </div>
                        </div>
                        <div className="card3">card3</div>
                        <div className="card4">card4</div>
                        <div className="box1">
                            <BarChart data={data1} />
                        </div>
                        <div className="box2">
                            <LineChart data={data} />
                        </div>
                        <div className="box3">
                            <PieChart data={data2} />
                        </div>
                    </div>  */}
                </div>
                {/* <ToastContainer /> */}
            </div>                            
        </Layout>
    )
}

export default Dashboard