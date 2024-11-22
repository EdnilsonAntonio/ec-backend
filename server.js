import express from 'express'; // Importar a bilioteca express
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // Importar a bilioteca Prisma
const prisma = new PrismaClient() // Instanciar a bilioteca prisma
const app = express(); // Variável app recebe o Express
app.use(express.json()) // Para trabalhar com JSON

// Adicione o middleware cors com a configuração de permissões
app.use(cors());
const PORT = process.env.PORT || 3001;

/* ROTA PRINCIPAL */

app.get('/', async (req, res) => {
    try {
        const users = await prisma.course.findMany(); // Operação real
        res.json(users);
    } catch (error) {
        console.error('Erro ao responder ao endpoint:', error);
        res.status(500).json({ error: 'Erro ao responder ao endpoint', details: error.message });
    }
});




/* ROTAS DE CURSOS */

// Obter todos os cursos
app.get('/courses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: true, // Inclui as lições de cada módulo
                    },
                },
            },
        });

        res.status(200).json(courses);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).json({ error: 'Erro ao buscar cursos', details: error.message });
    }
});

// Obter um curso específico pelo ID
app.get('/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: true, // Incluir as lições nos módulos
                    },
                },
            },
        });

        if (!course) {
            return res.status(404).json({ error: 'Curso não encontrado' });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error('Erro ao obter curso:', error);
        res.status(500).json({ error: 'Erro ao obter curso' });
    }
});

// Criar um novo curso
app.post('/courses', /**/ async (req, res) => {
    const { name, index } = req.body;

    try {
        const newCourse = await prisma.course.create({
            data: {
                name,
                index,
            },
        });

        res.status(201).json({ message: 'Curso criado com sucesso!', course: newCourse });
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({ error: 'Erro ao criar curso' });
    }
});

// Atualizar um curso existente
app.put('/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const { name, index } = req.body;

    try {
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
                name,
                index,
            },
        });

        res.status(200).json({ message: 'Curso atualizado com sucesso!', course: updatedCourse });
    } catch (error) {
        console.error('Erro ao atualizar curso:', error);
        res.status(500).json({ error: 'Erro ao atualizar curso' });
    }
});

// Excluir um curso existente
app.delete('/courses/:courseId', /**/ async (req, res) => {
    const { courseId } = req.params;

    try {
        await prisma.course.delete({
            where: { id: courseId },
        });

        res.status(200).json({ message: 'Curso excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir curso:', error);
        res.status(500).json({ error: 'Erro ao excluir curso' });
    }
});


/* ROTAS DE MÓDULOS */

// Criar um novo módulo dentro de um curso
app.post('/courses/:courseId/modules', /**/ async (req, res) => {
    const { name, index } = req.body;
    const { courseId } = req.params;

    try {
        const newModule = await prisma.module.create({
            data: {
                name,
                index,
                courseId, // Associar o módulo ao curso
            },
        });

        res.status(201).json({ message: 'Módulo criado com sucesso!', module: newModule });
    } catch (error) {
        console.error('Erro ao criar módulo:', error);
        res.status(500).json({ error: 'Erro ao criar módulo' });
    }
});

// Obter todos os módulos de um curso específico
app.get('/courses/:courseId/modules', async (req, res) => {
    const { courseId } = req.params;

    try {
        const modules = await prisma.module.findMany({
            where: { courseId },
            include: {
                lessons: true, // Incluir as lições associadas ao módulo
            },
            orderBy: {
                index: 'asc', // Ordenar módulos por índice
            },
        });

        res.status(200).json(modules);
    } catch (error) {
        console.error('Erro ao obter módulos:', error);
        res.status(500).json({ error: 'Erro ao obter módulos' });
    }
});

// Obter um módulo específico pelo ID
app.get('/modules/:moduleId', async (req, res) => {
    const { moduleId } = req.params;

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                lessons: true, // Incluir as lições associadas ao módulo
            },
        });

        if (!module) {
            return res.status(404).json({ error: 'Módulo não encontrado' });
        }

        res.status(200).json(module);
    } catch (error) {
        console.error('Erro ao obter módulo:', error);
        res.status(500).json({ error: 'Erro ao obter módulo' });
    }
});

// Atualizar um módulo existente
app.put('/modules/:moduleId',  async (req, res) => {
    const { moduleId } = req.params;
    const { name, index } = req.body;

    try {
        const updatedModule = await prisma.module.update({
            where: { id: moduleId },
            data: {
                name,
                index,
            },
        });

        res.status(200).json({ message: 'Módulo atualizado com sucesso!', module: updatedModule });
    } catch (error) {
        console.error('Erro ao atualizar módulo:', error);
        res.status(500).json({ error: 'Erro ao atualizar módulo' });
    }
});

// Excluir um módulo existente
app.delete('/modules/:moduleId',  async (req, res) => {
    const { moduleId } = req.params;

    try {
        await prisma.module.delete({
            where: { id: moduleId },
        });

        res.status(200).json({ message: 'Módulo excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir módulo:', error);
        res.status(500).json({ error: 'Erro ao excluir módulo' });
    }
});

// Excluir todos os módulos de um curso
app.delete('/courses/:courseId/modules', /**/ async (req, res) => {
    const { courseId } = req.params;

    // Tente
    try {
        await prisma.module.deleteMany({
            where: {
                courseId
            }
        })
        // Se a exclusão foi bem-sucedida, retorne uma mensagem de sucesso
        res.status(200).json({ message: 'Módulos excluidos com sucesso!' })
    }
    // Caso ocorra algum erro durante a exclusão, retorne o erro
    catch (error) {
        console.error('Erro ao excluir módulos:', error);
        res.status(500).json({ error: 'Erro ao excluir módulos' });
    }
})

/* ROTAS DE LIÇÕES */

// Criar uma nova lição dentro de um módulo
app.post('/modules/:moduleId/lessons', /**/ async (req, res) => {
    const { index, type, title, content } = req.body;
    const { moduleId } = req.params;

    try {
        const newLesson = await prisma.lesson.create({
            data: {
                index,
                type,
                title,
                content,
                moduleId, // Associar a lição ao módulo
            },
        });

        res.status(201).json({ message: 'Lição criada com sucesso!', lesson: newLesson });
    } catch (error) {
        console.error('Erro ao criar lição:', error);
        res.status(500).json({ error: 'Erro ao criar lição' });
    }
});

// Obter todas as lições de um módulo específico
app.get('/modules/:moduleId/lessons', async (req, res) => {
    const { moduleId } = req.params;

    try {
        const lessons = await prisma.lesson.findMany({
            where: { moduleId },
            orderBy: {
                index: 'asc', // Ordenar lições por índice
            },
        });

        res.status(200).json(lessons);
    } catch (error) {
        console.error('Erro ao obter lições:', error);
        res.status(500).json({ error: 'Erro ao obter lições' });
    }
});

// Obter uma lição específica pelo ID
app.get('/lessons/:lessonId', async (req, res) => {
    const { lessonId } = req.params;

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lição não encontrada' });
        }

        res.status(200).json(lesson);
    } catch (error) {
        console.error('Erro ao obter lição:', error);
        res.status(500).json({ error: 'Erro ao obter lição' });
    }
});

// Obter uma lição específica pelo índice
app.get('/courses/:courseId/modules/:lessonIndex', async (req, res) => {
    const { lessonIndex } = req.params;

    try {
        const lesson = await prisma.lesson.findFirst({
            where: {
                index : parseInt(lessonIndex)
            },
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lição não encontrada' });
        }

        res.status(200).json(lesson);
    } catch (error) {
        console.error('Erro ao obter lição:', error);
        res.status(500).json({ error: 'Erro ao obter lição' });
    }
})

// Atualizar uma lição existente
app.put('/lessons/:lessonId', /**/ async (req, res) => {
    const { lessonId } = req.params;
    const { index, type, title, content } = req.body;

    try {
        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                index,
                type,
                title,
                content,
            },
        });

        res.status(200).json({ message: 'Lição atualizada com sucesso!', lesson: updatedLesson });
    } catch (error) {
        console.error('Erro ao atualizar lição:', error);
        res.status(500).json({ error: 'Erro ao atualizar lição' });
    }
});

// Excluir uma lição existente
app.delete('/lessons/:lessonId',  async (req, res) => {
    const { lessonId } = req.params;

    try {
        await prisma.lesson.delete({
            where: { id: lessonId },
        });

        res.status(200).json({ message: 'Lição excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir lição:', error);
        res.status(500).json({ error: 'Erro ao excluir lição' });
    }
});

// Excluir todas as lições de um módulo
app.delete('/modules/:moduleId/lessons',  async (req, res) => {
    const { moduleId } = req.params;

    // Tente
    try {
        await prisma.lesson.deleteMany({
            where: {
                moduleId,
            }
        })
        res.status(200).json({ message: 'Lições excluídas com sucesso!' });
    }
    // Em caso de erro
    catch (error) {
        console.error('Erro ao excluir lições de um módulo:', error);
        res.status(500).json({ error: 'Erro ao excluir lições de um módulo' });
    }
})

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;