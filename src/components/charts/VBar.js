import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    registerables 
} from 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';
  
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    ...registerables
)

const BarChart = (props) => {
    const {data} = props
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Vertical Bar Chart',
            },
        },
        maintainAspectRatio: false,
        // datalabels: {
        //     anchor: 'end',
        //     align: 'top',
        //     color: 'black',
        //     font: {
        //       weight: 'bold',
        //     },
        // },
        // indexAxis: 'y',
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
            padding: 10
        },
        animation: true,
        animationDuration: 2000,
        animationEasing: 'easeInCubic',
    }    

    return (
        <Bar options={options} data={data} />
    )
}

export default BarChart