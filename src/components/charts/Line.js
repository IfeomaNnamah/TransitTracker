import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js/auto'
import { Line } from 'react-chartjs-2'
  
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const LineChart = (props) => {
    const {data} = props
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Line Chart',
            },
        },
        maintainAspectRatio: false,
        // responsiveAnimationDuration: 0,
        // scales: {
        //     x: {
        //         display: true,
        //         title: {
        //             display: true,
        //             text: 'Month',
        //         },
        //     },
        //     y: {
        //         display: true,
        //         title: {
        //             display: true,
        //             text: 'Value',
        //         },
        //         // beginAtZero: true,
        //     },
        // },
        layout: {
            padding: 15
        },
        animation: true,
        animationDuration: 2000,
        animationEasing: 'easeInCubic',
    
    }    

    return (
        <Line options={options} data={data} />
    )
}

export default LineChart