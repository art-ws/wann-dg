---
title: Modeling
tags: [ "GoogleDocs" ]
---

Author: [[Meta/Team/Victor|Victor]]

## What is modeling?

> Modeling, in a general sense, refers to the process of creating a representation or abstraction of a real-world system, concept, or phenomenon. It involves constructing a simplified version of the system or concept that captures its essential features and behaviors.

> In various fields such as science, engineering, statistics, and computer science, modeling plays a crucial role in understanding, analyzing, and predicting complex systems. Models can be mathematical, physical, conceptual, or computational, depending on the nature of the system being studied and the purpose of the model.

> We are mostly interested in mathematical modeling. It involves using mathematical equations and formulas to describe the relationships and interactions between different variables in a system. This approach often employs mathematical tools such as differential equations, probability theory, optimization techniques, and statistical methods.

*By [[Meta/Team/ChatGPT|ChatGPT]]*

## What is a mathematical model ?

Mathematical model is usually a dynamical system which consists of *variables* (changeable, non-constant numbers) and some *equations* (rules)  under which they perform some evolution.

To use the model, scientists have to create a bridge between abstract mathematical objects and the real world; _variables _(or functions of them) are_ _matching with the numbers that can be observed in experiments using some measuring devices (coordinates, velocities, voltages, time intervals, pressures, temperatures etc). The quality of the model can then be defined as “how close are such values that we get as a calculation from our theory (model) and as measurement in the experiment.”



## Models hierarchy

As we add more features of some phenomenon in consideration the model becomes more precise and more complex. One requirement for a _better _model_ _is to include the previous ( _simpler_ ) model as a special limit where newly considered effects are negligible. 

One classic example is Classical (Newtonian) Mechanics and Special Relativity: for bodies that move with the speed comparable to the speed of light it is no longer possible to describe their motion with Classical Mechanics. Fortunately Special Relativity appears to be able to describe both cases: when bodies move with significantly less velocity than light and with the velocity comparable to the speed of light; in the limit of small velocities both theories produce exactly the same results.



## Mathematical model (framework) of an Artificial Neural Network

In general, any learning system is a dynamical system that consists of two types of variables: trainable and non-trainable. These two types differ in their dynamics. Non-trainable variables evolve according to some predefined rule (Activation dynamics). Trainable variables are adjusted in order to minimize loss function (Learning dynamics).

[Google Doc](https://docs.google.com/document/d/1aIkGhGOnhAYBzbigTZAQcSe35k0bBeoTG_x8A3bhHrk/edit)