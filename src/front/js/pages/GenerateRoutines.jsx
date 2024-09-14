import React, { useState, useContext } from 'react';
import { Context } from '../store/appContext';
import Select from 'react-select';
import '../../styles/Recipe.css';

export const GenerateRoutines = () => {
    const { store, actions } = useContext(Context);
    const [routineData, setRoutineData] = useState({
        days: [],
        hours_per_day: '',
        target_muscles: [],
        level: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);

    const daysOptions = [
        { value: "Monday", label: "Lunes" },
        { value: "Tuesday", label: "Martes" },
        { value: "Wednesday", label: "Miércoles" },
        { value: "Thursday", label: "Jueves" },
        { value: "Friday", label: "Viernes" },
        { value: "Saturday", label: "Sábado" },
        { value: "Sunday", label: "Domingo" }
    ];

    const muscles = [
        { value: "chest", label: "Pecho" },
        { value: "back", label: "Espalda" },
        { value: "biceps", label: "Bíceps" },
        { value: "triceps", label: "Tríceps" },
        { value: "shoulders", label: "Hombros" },
        { value: "legs", label: "Piernas" }
    ];

    const levels = [
        { value: "beginner", label: "Principiante" },
        { value: "intermediate", label: "Intermedio" },
        { value: "advanced", label: "Avanzado" }
    ];

    const genderOptions = [
        { value: "male", label: "Hombre" },
        { value: "female", label: "Mujer" }
    ];

    const handleGenerateRoutine = async () => {
        actions.clearError();
        setLoading(true);
        await actions.generateRoutine({
            ...routineData,
            days: routineData.days.map(option => option.value),
            target_muscles: routineData.target_muscles.map(option => option.value)
        });
        setLoading(false);
    };

    const handleSaveToFavorites = () => {
        if (!store.currentUser) {
            alert("Por favor, inicie sesión para guardar esta rutina en sus favoritos.");
            return;
        }

        actions.addFavoriteRoutine({
            routine: store.generatedRoutine,
            days: routineData.days.map(option => option.value).join(", "),
            hours_per_day: routineData.hours_per_day,
            level: routineData.level,
            gender: routineData.gender,  // Include gender in favorites data
            target_muscles: routineData.target_muscles.map(option => option.value).join(", ")
        });
    };

    const handleHoursChange = (e) => {
        let value = e.target.value;
        value = value.replace(/[^\d.]/g, '');

        if (value === '') {
            setRoutineData({ ...routineData, hours_per_day: '' });
        } else {
            const numericValue = parseFloat(value);
            if (numericValue < 0) {
                setRoutineData({ ...routineData, hours_per_day: '0' });
            } else if (numericValue > 24) {
                setRoutineData({ ...routineData, hours_per_day: '24' });
            } else {
                setRoutineData({ ...routineData, hours_per_day: value });
            }
        }
    };

    return (
        <div style={{ backgroundColor: '#d3d3d3', height: 'auto' }}>
            <div className='row'>
                <div className='container mt-5'>
                </div>
                <div className="container my-5">
                    <div className='text-center mx-3'>
                        <h2 style={{ color: 'black' }}>GENERE SU RUTINA DE EJERCICIO</h2>
                    </div>
                    <div className="mx-3">
                        <Select
                            isMulti
                            options={daysOptions}
                            value={routineData.days}
                            onChange={(selectedOptions) => setRoutineData({ ...routineData, days: selectedOptions })}
                            className="mb-2"
                            placeholder="Seleccione los días"
                        />

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Horas por día"
                            value={routineData.hours_per_day}
                            onChange={handleHoursChange}
                        />

                        <Select
                            isMulti
                            options={muscles}
                            value={routineData.target_muscles}
                            onChange={(selectedOptions) => setRoutineData({ ...routineData, target_muscles: selectedOptions })}
                            className="mb-2"
                            placeholder="Seleccione los músculos objetivo"
                        />

                        <Select
                            options={levels}
                            value={levels.find(option => option.value === routineData.level)}
                            onChange={(selectedOption) => setRoutineData({ ...routineData, level: selectedOption.value })}
                            className="mb-2"
                            placeholder="Seleccione el nivel"
                        />

                        {/* Gender dropdown */}
                        <Select
                            options={genderOptions}
                            value={genderOptions.find(option => option.value === routineData.gender)}
                            onChange={(selectedOption) => setRoutineData({ ...routineData, gender: selectedOption.value })}
                            className="mb-2"
                            placeholder="Seleccione el género"
                        />

                        <button onClick={handleGenerateRoutine} className="btn btn-warning mt-3">
                            {loading ? "Generando..." : "Generar Rutina"}
                        </button>
                    </div>

                    {store.generatedRoutine && (
                        <div className="d-flex justify-content-center">
                            <div className="alert mt-3" style={{ backgroundColor: '#FFFACD', color: 'black', maxWidth: '800px', width: '100%' }}>
                                <h3 className="text-center">Rutina Generada</h3>
                                <div className="routine-content" dangerouslySetInnerHTML={{ __html: formatRoutine(store.generatedRoutine) }} />
                                <button onClick={handleSaveToFavorites} className="btn btn-warning mt-3 w-100">Guardar en Favoritos</button>
                            </div>
                        </div>
                    )}

                    {store.error && (
                        <div className="alert alert-danger mt-3">
                            {store.error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function to format the routine
const formatRoutine = (routine) => {
    return routine
        .replace(/\*\*(.*?)\*\*/g, '<h4>$1</h4>')  // Convert **Day 1: Back and Triceps** to <h4>Day 1: Back and Triceps</h4>
        .replace(/\*(.*?)\*/g, '<li>$1</li>')  // Convert * Warm-up (10 minutes): to <li>Warm-up (10 minutes):</li>
        .replace(/(\d+\.\s)/g, '<br /><strong>$1</strong>')  // Convert 1. Warm-up to <br /><strong>1. Warm-up</strong>
        .replace(/<br \/>/g, '')  // Remove extra <br />
        .replace(/-\s/g, '• ')  // Convert * to bullet points
        .replace(/\n/g, '<br />');  // Convert newlines to <br />
};