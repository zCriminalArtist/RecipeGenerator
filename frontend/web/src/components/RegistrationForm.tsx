import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../utils/api';

const userSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
});

type UserRegistrationData = z.infer<typeof userSchema>;

const UserRegistration: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<UserRegistrationData>({
        resolver: zodResolver(userSchema),
    });

    const onSubmit = async (data: UserRegistrationData) => {
        try {
            const response = await api.post("/api/auth/register", data);
            console.log('User registered successfully:', response.data);
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Username:</label>
                <input type="text" {...register('username')} />
                {errors.username && <p>{errors.username.message}</p>}
            </div>
            <div>
                <label>Email:</label>
                <input type="email" {...register('email')} />
                {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div>
                <label>Password:</label>
                <input type="password" {...register('password')} />
                {errors.password && <p>{errors.password.message}</p>}
            </div>
            <div>
                <label>First Name:</label>
                <input type="text" {...register('firstName')} />
                {errors.firstName && <p>{errors.firstName.message}</p>}
            </div>
            <div>
                <label>Last Name:</label>
                <input type="text" {...register('lastName')} />
                {errors.lastName && <p>{errors.lastName.message}</p>}
            </div>
            <button type="submit">Register</button>
        </form>
    );
};

export default UserRegistration;