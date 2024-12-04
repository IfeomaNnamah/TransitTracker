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
import { Pie } from 'react-chartjs-2'
  
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const PieChart = (props) => {
    const {data} = props
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Pie Chart',
            },
        },
        maintainAspectRatio: false,
        layout: {
            padding: 10
        },
        animation: true,
        animationDuration: 2000,
        animationEasing: 'easeInCubic',    
    }    

    return (
        <Pie options={options} data={data} />
    )
}

export default PieChart